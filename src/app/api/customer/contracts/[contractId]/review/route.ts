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
          { message: "Revision instructions cannot exceed 5000 characters." },
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
          message: "Only submitted work can be approved or sent for revision.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedContract = await tx.contract.update({
        where: { id: contract.id },
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

      await tx.job.update({
        where: { id: contract.jobId },
        data: {
          status:
            action === "approve"
              ? JobStatus.COMPLETED
              : JobStatus.REVISION_REQUESTED,
        },
      });

      return updatedContract;
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

    return NextResponse.json(
      { message: "An unexpected error occurred while reviewing the work." },
      { status: 500 }
    );
  }
}