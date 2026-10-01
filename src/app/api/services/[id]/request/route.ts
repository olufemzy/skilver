import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to request a service." },
        { status: 401 }
      );
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can request services." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      description,
      budget,
      serviceType,
      location,
      deadline,
      attachments,
    } = body;

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "Please provide a description of what you need.",
        },
        { status: 400 }
      );
    }

    if (
      budget === undefined ||
      budget === null ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) <= 0
    ) {
      return NextResponse.json(
        {
          error: "Please provide a valid budget.",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          error: "Customer profile not found.",
        },
        { status: 404 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        isActive: true,
        provider: {
          user: {
            isActive: true,
            isSuspended: false,
          },
        },
        category: {
          isActive: true,
        },
      },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          error: "Service not found or is no longer available.",
        },
        { status: 404 }
      );
    }

    if (service.provider.userId === session.user.id) {
      return NextResponse.json(
        {
          error: "You cannot request your own service.",
        },
        { status: 400 }
      );
    }

    const validServiceType =
      serviceType === "REMOTE" ||
      serviceType === "PHYSICAL"
        ? serviceType
        : service.serviceType;

    let parsedDeadline: Date | null = null;

    if (deadline) {
      const deadlineDate = new Date(deadline);

      if (Number.isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid deadline.",
          },
          { status: 400 }
        );
      }

      parsedDeadline = deadlineDate;
    }

    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        categoryId: service.categoryId,
        serviceId: service.id,

        title: `Request for: ${service.title}`,
        description: description.trim(),

        budget: Number(budget),
        currency: service.currency,

        serviceType: validServiceType,

        location:
          location?.trim() || null,

        deadline: parsedDeadline,

        providersNeeded: 1,

        status: "OPEN",

        attachments:
          Array.isArray(attachments)
            ? attachments
            : [],

        isAiReviewed: false,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Service request submitted successfully.",
        job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to request service:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to submit service request.",
      },
      { status: 500 }
    );
  }
}