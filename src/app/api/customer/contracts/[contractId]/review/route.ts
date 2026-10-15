import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { contractId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Only customers can review submitted work." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, revisionMessage } = body;

    if (!["approve", "request_revision"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid review action." },
        { status: 400 }
      );
    }

    if (action === "request_revision") {
      if (
        typeof revisionMessage !== "string" ||
        !revisionMessage.trim()
      ) {
        return NextResponse.json(
          { message: "Please explain what needs to be revised." },
          { status: 400 }
        );
      }

      if (revisionMessage.trim().length > 5000) {
        return NextResponse.json(
          {
            message:
              "Revision instructions cannot exceed 5000 characters.",
          },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer profile not found." },
        { status: 404 }
      );
    }

    const contract = await prisma.contract.findFirst({
      where: {
        id: params.contractId,
        customerId: customer.id,
      },
      select: {
        id: true,
        jobId: true,
        status: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { message: "Contract not found." },
        { status: 404 }
      );
    }

    if (contract.status !== JobStatus.SUBMITTED) {
      return NextResponse.json(
        {
          message:
            "Only submitted work can be approved or sent for revision.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update only the contract being reviewed.
      const updatedContract = await tx.contract.updateMany({
        where: {
          id: contract.id,
          customerId: customer.id,
          status: JobStatus.SUBMITTED,
        },
        data:
          action === "approve"
            ? {
                status: JobStatus.COMPLETED,
                completedAt: new Date(),
                revisionMessage: null,
              }
            : {
                status: JobStatus.REVISION_REQUESTED,
                revisionMessage: revisionMessage.trim(),
              },
      });

      // Protect against a second review of an already-reviewed contract.
      if (updatedContract.count === 0) {
        throw new Error(
          "This contract has already been reviewed. Refresh the page and try again."
        );
      }

      // Read all contract statuses after updating this contract.
      const contracts = await tx.contract.findMany({
        where: { jobId: contract.jobId },
        select: { status: true },
      });

      const allCompleted =
        contracts.length > 0 &&
        contracts.every(
          (item) => item.status === JobStatus.COMPLETED
        );
      const activeStatuses: JobStatus[] = [
        JobStatus.IN_PROGRESS,
        JobStatus.SUBMITTED,
        JobStatus.REVISION_REQUESTED,
      ];

      const anyActive = contracts.some((item) =>
        activeStatuses.includes(item.status)
      );

      // A job is complete only when every contract is complete.
      // Otherwise, keep it active while any contract is unfinished.
      const nextJobStatus = allCompleted
        ? JobStatus.COMPLETED
        : anyActive
          ? JobStatus.IN_PROGRESS
          : undefined;

      if (nextJobStatus) {
        await tx.job.update({
          where: { id: contract.jobId },
          data: { status: nextJobStatus },
        });
      }

      return tx.contract.findUnique({
        where: { id: contract.id },
      });
    });

    return NextResponse.json({
      message:
        action === "approve"
          ? "Work approved successfully."
          : "Revision requested successfully.",
      contract: result,
    });
  } catch (error) {
    console.error("Contract review error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message.includes("already been reviewed")) {
      return NextResponse.json({ message }, { status: 409 });
    }

    return NextResponse.json(
      {
        message:
          "An unexpected error occurred while reviewing the work.",
      },
      { status: 500 }
    );
  }
}