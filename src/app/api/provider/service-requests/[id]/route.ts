import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can manage service requests." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (action !== "ACCEPT" && action !== "DECLINE") {
      return NextResponse.json(
        { error: "Action must be ACCEPT or DECLINE." },
        { status: 400 }
      );
    }

    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider profile not found." },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const job = await tx.job.findFirst({
          where: {
            id: params.id,
            serviceRequestStatus: "PENDING",
            status: "OPEN",
            service: {
              is: {
                providerId: provider.id,
              },
            },
          },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                providerId: true,
              },
            },
          },
        });

        if (!job) {
          throw new Error("REQUEST_NOT_AVAILABLE");
        }

        if (action === "DECLINE") {
          const updatedJob = await tx.job.update({
            where: {
              id: job.id,
            },
            data: {
              serviceRequestStatus: "DECLINED",
            },
          });

          return {
            action: "DECLINED" as const,
            job: updatedJob,
          };
        }

        const existingContract = await tx.contract.findFirst({
          where: {
            jobId: job.id,
          },
          select: {
            id: true,
          },
        });

        if (existingContract) {
          throw new Error("CONTRACT_ALREADY_EXISTS");
        }

        const contract = await tx.contract.create({
          data: {
            jobId: job.id,
            customerId: job.customerId,
            providerId: provider.id,
            agreedPrice: job.budget,
            currency: job.currency,
            deadline: job.deadline,
            status: "IN_PROGRESS",
            workFiles: [],
          },
        });

        const updatedJob = await tx.job.update({
          where: {
            id: job.id,
          },
          data: {
            serviceRequestStatus: "ACCEPTED",
            status: "IN_PROGRESS",
          },
        });

        return {
          action: "ACCEPTED" as const,
          job: updatedJob,
          contract,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return NextResponse.json({
      message:
        result.action === "ACCEPTED"
          ? "Service request accepted and contract created."
          : "Service request declined.",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REQUEST_NOT_AVAILABLE") {
        return NextResponse.json(
          {
            error:
              "This request is unavailable, has already been handled, or does not belong to your service.",
          },
          { status: 404 }
        );
      }

      if (error.message === "CONTRACT_ALREADY_EXISTS") {
        return NextResponse.json(
          {
            error: "A contract already exists for this request.",
          },
          { status: 409 }
        );
      }
    }

    console.error(
      "Failed to process service request:",
      error
    );

    return NextResponse.json(
      { error: "Failed to process service request." },
      { status: 500 }
    );
  }
}
