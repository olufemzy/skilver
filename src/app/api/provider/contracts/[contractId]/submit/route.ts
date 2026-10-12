import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    contractId: string;
  };
};

type WorkFile = {
  name: string;
  url: string;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can submit work." },
        { status: 403 }
      );
    }

    // 2. Find the provider profile belonging to this user
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

    // 3. Read the submission
    const body = await request.json();

    const workMessage =
      typeof body.workMessage === "string"
        ? body.workMessage.trim()
        : "";

    const workFiles: WorkFile[] = Array.isArray(body.workFiles)
      ? body.workFiles
      : [];

    // 4. Validate the submission
    if (!workMessage) {
      return NextResponse.json(
        { error: "Please include a message describing your work." },
        { status: 400 }
      );
    }

    if (workMessage.length > 5000) {
      return NextResponse.json(
        { error: "Your message cannot exceed 5,000 characters." },
        { status: 400 }
      );
    }

    if (workFiles.length > 20) {
      return NextResponse.json(
        { error: "You can submit a maximum of 20 work links." },
        { status: 400 }
      );
    }

    const validFiles = workFiles.every(
      (file) =>
        file &&
        typeof file.name === "string" &&
        file.name.trim().length > 0 &&
        typeof file.url === "string" &&
        (() => {
          try {
            const url = new URL(file.url);

            return (
              url.protocol === "https:" ||
              url.protocol === "http:"
            );
          } catch {
            return false;
          }
        })()
    );

    if (!validFiles) {
      return NextResponse.json(
        {
          error:
            "Each work link must have a name and a valid HTTP or HTTPS URL.",
        },
        { status: 400 }
      );
    }

    // 5. Verify contract ownership and status
    const contract = await prisma.contract.findFirst({
      where: {
        id: params.contractId,
        providerId: provider.id,
      },
      select: {
        id: true,
        jobId: true,
        status: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    if (
      contract.status !== "IN_PROGRESS" &&
      contract.status !== "REVISION_REQUESTED"
    ) {
      return NextResponse.json(
        {
          error:
            "Work can only be submitted when the contract is in progress or revisions have been requested.",
        },
        { status: 409 }
      );
    }

    // 6. Save the submission and update the job
    const result = await prisma.$transaction(async (tx) => {
      const updatedContract = await tx.contract.update({
        where: {
          id: contract.id,
        },
        data: {
          workMessage,
          workFiles: validFiles ? workFiles : [],
          submittedAt: new Date(),
          status: "SUBMITTED",
        },
        select: {
          id: true,
          status: true,
          workMessage: true,
          workFiles: true,
          submittedAt: true,
        },
      });

      await tx.job.update({
        where: {
          id: contract.jobId,
        },
        data: {
          status: "SUBMITTED",
        },
      });

      return updatedContract;
    });

    return NextResponse.json({
      message: "Work submitted successfully.",
      contract: result,
    });
  } catch (error) {
    console.error("Failed to submit work:", error);

    return NextResponse.json(
      { error: "Failed to submit your work." },
      { status: 500 }
    );
  }
}