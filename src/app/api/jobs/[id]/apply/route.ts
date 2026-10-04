import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  proposal: z
    .string()
    .min(50, "Proposal must be at least 50 characters long")
    .max(5000, "Proposal must not exceed 5000 characters"),

  price: z
    .number()
    .min(500, "Price must be at least ₦500"),

  deliveryDays: z
    .number()
    .int()
    .min(1, "Delivery time must be at least 1 day")
    .max(365, "Delivery time cannot exceed 365 days"),

  experience: z
    .string()
    .max(2000, "Experience must not exceed 2000 characters")
    .optional()
    .default(""),

  portfolioLinks: z
    .array(z.string())
    .max(10)
    .optional()
    .default([]),
});

type RouteContext = {
  params: {
    id: string;
  };
};

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

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        {
          error: "Only providers can apply for jobs",
        },
        { status: 403 }
      );
    }

    /*
     * Find the provider profile belonging to
     * the currently logged-in user.
     */
    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!provider) {
      return NextResponse.json(
        {
          error: "Provider profile not found",
        },
        { status: 404 }
      );
    }

    /*
     * Find the job.
     */
    const job = await prisma.job.findUnique({
      where: {
        id: params.id,
      },
      include: {
        service: {
          select: {
            id: true,
            providerId: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    /*
     * Applications are only allowed while
     * the job is still open.
     */
    if (job.status !== "OPEN") {
      return NextResponse.json(
        {
          error:
            "This job is no longer accepting applications",
        },
        { status: 400 }
      );
    }

    /*
     * A provider cannot apply to their own
     * service request.
     *
     * This applies to jobs created from an
     * existing provider service.
     */
    if (
      job.service &&
      job.service.providerId === provider.id
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot apply to your own service request",
        },
        { status: 400 }
      );
    }

    /*
     * Check whether this provider has already
     * applied for the job.
     */
    const existingApplication =
      await prisma.application.findUnique({
        where: {
          jobId_providerId: {
            jobId: job.id,
            providerId: provider.id,
          },
        },
      });

    if (existingApplication) {
      return NextResponse.json(
        {
          error:
            "You have already applied for this job",
        },
        { status: 409 }
      );
    }

    /*
     * Read request body.
     */
    const body = await req.json();

    /*
     * Convert numeric values because form
     * submissions commonly arrive as strings.
     */
    const parsedBody = {
      ...body,
      price:
        typeof body.price === "string"
          ? Number(body.price)
          : body.price,

      deliveryDays:
        typeof body.deliveryDays === "string"
          ? Number(body.deliveryDays)
          : body.deliveryDays,
    };

    /*
     * Validate application data.
     */
    const validation = schema.safeParse(parsedBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid application data",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    /*
     * Prevent providers from submitting an
     * unrealistic price below the platform minimum.
     */
    if (data.price <= 0) {
      return NextResponse.json(
        {
          error: "Price must be greater than zero",
        },
        { status: 400 }
      );
    }

    /*
     * Create the application.
     */
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        providerId: provider.id,
        proposal: data.proposal,
        price: data.price,
        currency: job.currency,
        deliveryDays: data.deliveryDays,
        experience: data.experience || null,
        portfolioLinks: data.portfolioLinks,
        status: "PENDING",
      },

      select: {
        id: true,
        jobId: true,
        providerId: true,
        proposal: true,
        price: true,
        currency: true,
        deliveryDays: true,
        experience: true,
        portfolioLinks: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        application,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to submit job application:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}
