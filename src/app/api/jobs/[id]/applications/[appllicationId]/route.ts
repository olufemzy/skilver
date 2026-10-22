import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
    applicationId: string;
  };
};

const MAX_TRANSACTION_ATTEMPTS = 3;

function isSerializationConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only customers can make application decisions.
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can decide on applications" },
        { status: 403 }
      );
    }

    let body: { action?: unknown; rejectionNote?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const action = body.action;

    const rejectionNote =
      typeof body.rejectionNote === "string"
        ? body.rejectionNote.trim()
        : "";

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be accept or reject" },
        { status: 400 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        title: true,
        customerId: true,
        status: true,
        providersNeeded: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Verify that this customer owns the job.
    if (job.customerId !== customer.id) {
      return NextResponse.json(
        { error: "You do not own this job" },
        { status: 403 }
      );
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job is no longer open for decisions" },
        { status: 409 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        id: params.applicationId,
        jobId: job.id,
      },
      select: {
        id: true,
        providerId: true,
        price: true,
        currency: true,
        deliveryDays: true,
        status: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found for this job" },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: "This application has already been decided" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // REJECT APPLICATION
    // --------------------------------------------------

    if (action === "reject") {
      const result = await prisma.application.updateMany({
        where: {
          id: application.id,
          jobId: job.id,
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
          rejectionNote: rejectionNote || null,
        },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "This application has already been decided" },
          { status: 409 }
        );
      }

      return NextResponse.json({
        message: "Application rejected successfully",
      });
    }

    // --------------------------------------------------
    // ACCEPT APPLICATION
    //
    // Each accepted provider receives a separate contract.
    // The job remains OPEN until providersNeeded is reached.
    // Once the limit is reached, the job moves to IN_PROGRESS
    // and all remaining pending applications are rejected.
    // --------------------------------------------------

    const result = await (async () => {
      for (
        let attempt = 0;
        attempt < MAX_TRANSACTION_ATTEMPTS;
        attempt++
      ) {
        try {
          return await prisma.$transaction(
            async (tx) => {
              const currentJob = await tx.job.findUnique({
                where: {
                  id: job.id,
                },
                select: {
                  status: true,
                  customerId: true,
                  providersNeeded: true,
                },
              });

              if (
                !currentJob ||
                currentJob.customerId !== customer.id ||
                currentJob.status !== "OPEN"
              ) {
                throw new Error("JOB_NO_LONGER_OPEN");
              }

              const currentApplication =
                await tx.application.findFirst({
                  where: {
                    id: application.id,
                    jobId: job.id,
                    status: "PENDING",
                  },
                  select: {
                    id: true,
                    providerId: true,
                    price: true,
                    currency: true,
                    deliveryDays: true,
                  },
                });

              if (!currentApplication) {
                throw new Error("APPLICATION_ALREADY_DECIDED");
              }

              // Count contracts already created for this job.
              const existingContracts = await tx.contract.count({
                where: {
                  jobId: job.id,
                },
              });

              const providersNeeded = Math.max(
                1,
                currentJob.providersNeeded
              );

              // Do not hire beyond the requested number.
              if (existingContracts >= providersNeeded) {
                throw new Error("HIRING_LIMIT_REACHED");
              }

              // Mark this application as accepted.
              const updated = await tx.application.updateMany({
                where: {
                  id: currentApplication.id,
                  jobId: job.id,
                  status: "PENDING",
                },
                data: {
                  status: "ACCEPTED",
                },
              });

              if (updated.count === 0) {
                throw new Error("APPLICATION_ALREADY_DECIDED");
              }

              // Calculate the provider's deadline.
              const deadline = new Date();

              deadline.setDate(
                deadline.getDate() +
                  currentApplication.deliveryDays
              );

              // Create a separate contract for this provider.
              const newContract = await tx.contract.create({
                data: {
                  jobId: job.id,
                  customerId: currentJob.customerId,
                  providerId: currentApplication.providerId,
                  agreedPrice: currentApplication.price,
                  currency: currentApplication.currency,
                  deadline,
                  workFiles: [],
                },
              });

              const providersHired = existingContracts + 1;

              const hiringLimitReached =
                providersHired >= providersNeeded;

              if (hiringLimitReached) {
                // All required provider slots are now filled.
                await tx.job.update({
                  where: {
                    id: job.id,
                  },
                  data: {
                    status: "IN_PROGRESS",
                  },
                });

                // Reject remaining applications only when
                // the required number of providers is reached.
                await tx.application.updateMany({
                  where: {
                    jobId: job.id,
                    id: {
                      not: currentApplication.id,
                    },
                    status: "PENDING",
                  },
                  data: {
                    status: "REJECTED",
                    rejectionNote:
                      "The required number of providers has been reached.",
                  },
                });
              }

              return {
                contract: newContract,
                providersHired,
                providersNeeded,
                hiringLimitReached,
              };
            },
            {
              isolationLevel: "Serializable",
            }
          );
        } catch (error) {
          // Retry serialization conflicts, which can occur
          // when two acceptances happen at nearly the same time.
          if (
            isSerializationConflict(error) &&
            attempt < MAX_TRANSACTION_ATTEMPTS - 1
          ) {
            continue;
          }

          throw error;
        }
      }

      throw new Error("TRANSACTION_RETRY_EXHAUSTED");
    })();

    return NextResponse.json({
      message: result.hiringLimitReached
        ? "Application accepted. The required number of providers has been reached."
        : "Application accepted and contract created. The job remains open for additional providers.",
      contract: result.contract,
      providersHired: result.providersHired,
      providersNeeded: result.providersNeeded,
      hiringLimitReached: result.hiringLimitReached,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "JOB_NO_LONGER_OPEN") {
        return NextResponse.json(
          { error: "This job is no longer open" },
          { status: 409 }
        );
      }

      if (error.message === "APPLICATION_ALREADY_DECIDED") {
        return NextResponse.json(
          { error: "This application has already been decided" },
          { status: 409 }
        );
      }

      if (error.message === "HIRING_LIMIT_REACHED") {
        return NextResponse.json(
          {
            error:
              "The required number of providers has already been reached.",
          },
          { status: 409 }
        );
      }

      if (error.message === "TRANSACTION_RETRY_EXHAUSTED") {
        return NextResponse.json(
          {
            error:
              "Another application decision is being processed. Please try again.",
          },
          { status: 409 }
        );
      }
    }

    console.error("Application decision failed:", error);

    return NextResponse.json(
      { error: "Failed to process application decision" },
      { status: 500 }
    );
  }
}