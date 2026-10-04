import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { moderateJobPost } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs
 *
 * Fetch jobs from the database.
 *
 * Supported query parameters:
 * ?page=1
 * ?pageSize=20
 * ?category=digital-tech
 * ?status=OPEN
 * ?serviceType=REMOTE
 * ?search=logo
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10)
    );

    const pageSize = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(searchParams.get("pageSize") || "20", 10)
      )
    );

    const categorySlug = searchParams.get("category");
    const status = searchParams.get("status") || "OPEN";
    const serviceType = searchParams.get("serviceType");
    const search = searchParams.get("search");

    const where: any = {
      status,
    };

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
        isActive: true,
      };
    }

    if (serviceType && ["REMOTE", "PHYSICAL", "BOTH"].includes(serviceType)) {
      where.serviceType = serviceType;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          customer: {
            select: {
              id: true,
              customerType: true,
              businessName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  location: true,
                },
              },
            },
          },

          service: {
            select: {
              id: true,
              title: true,
            },
          },

          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),

      prisma.job.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: jobs,
      total,
      page,
      pageSize,
      hasMore: skip + jobs.length < total,
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch jobs",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 *
 * Create a new job.
 *
 * Only authenticated customers can create general jobs.
 */
export async function POST(req: NextRequest) {
  try {
    /*
     * 1. Check authentication
     */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to post a job.",
        },
        { status: 401 }
      );
    }

    /*
     * 2. Make sure the logged-in user is a customer.
     */
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          error: "Only customers can post jobs.",
        },
        { status: 403 }
      );
    }

    /*
     * 3. Find the customer's profile.
     */
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

    /*
     * 4. Read request body.
     */
    const body = await req.json();

    const {
      title,
      categoryId,
      description,
      budget,
      serviceType,
      location,
      deadline,
      providersNeeded,
    } = body;

    /*
     * 5. Validate required fields.
     */
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        {
          error: "Job title must be at least 5 characters.",
        },
        { status: 400 }
      );
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 50
    ) {
      return NextResponse.json(
        {
          error: "Job description must be at least 50 characters.",
        },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        {
          error: "Category is required.",
        },
        { status: 400 }
      );
    }

    const numericBudget = Number(budget);

    if (!Number.isFinite(numericBudget) || numericBudget < 500) {
      return NextResponse.json(
        {
          error: "Minimum budget is ₦500.",
        },
        { status: 400 }
      );
    }

    if (
      !serviceType ||
      !["REMOTE", "PHYSICAL", "BOTH"].includes(serviceType)
    ) {
      return NextResponse.json(
        {
          error: "Invalid service type.",
        },
        { status: 400 }
      );
    }

    const numericProvidersNeeded = Number(providersNeeded ?? 1);

    if (
      !Number.isInteger(numericProvidersNeeded) ||
      numericProvidersNeeded < 1 ||
      numericProvidersNeeded > 10
    ) {
      return NextResponse.json(
        {
          error: "Number of providers needed must be between 1 and 10.",
        },
        { status: 400 }
      );
    }

    /*
     * 6. Validate location.
     *
     * Remote jobs don't require a physical location.
     */
    const cleanLocation =
      typeof location === "string" && location.trim()
        ? location.trim()
        : null;

    if (serviceType === "PHYSICAL" && !cleanLocation) {
      return NextResponse.json(
        {
          error: "Location is required for physical jobs.",
        },
        { status: 400 }
      );
    }

    /*
     * 7. Validate deadline if supplied.
     */
    let deadlineDate: Date | null = null;

    if (deadline) {
      const parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid deadline.",
          },
          { status: 400 }
        );
      }

      if (parsedDeadline <= new Date()) {
        return NextResponse.json(
          {
            error: "Deadline must be a future date.",
          },
          { status: 400 }
        );
      }

      deadlineDate = parsedDeadline;
    }

    /*
     * 8. Verify that the selected category exists
     * and is active.
     */
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    /*
     * 9. AI moderation.
     *
     * If AI moderation fails completely, we don't want
     * the customer to lose their job posting just because
     * the AI service is temporarily unavailable.
     */
    let aiFlagged = false;
    let aiFlagReason: string | null = null;

    try {
      const moderation = await moderateJobPost(
        title.trim(),
        description.trim()
      );

      aiFlagged = Boolean(moderation.flagged);
      aiFlagReason = moderation.reason || null;
    } catch (error) {
      console.error("Job moderation failed:", error);

      /*
       * Continue creating the job.
       * We don't block job posting because of an AI outage.
       */
    }

    /*
     * 10. Create the job.
     */
    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        categoryId: category.id,

        title: title.trim(),
        description: description.trim(),

        budget: numericBudget,
        currency: "NGN",

        serviceType,

        location: cleanLocation,
        deadline: deadlineDate,

        providersNeeded: numericProvidersNeeded,

        /*
         * No attachments are currently submitted
         * by the Post Job form.
         */
        attachments: [],

        isAiReviewed: true,
        aiFlagReason: aiFlagged ? aiFlagReason : null,

        status: "OPEN",
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    /*
     * 11. Return the newly created job.
     */
    return NextResponse.json(
      {
        id: job.id,
        job,
        message: aiFlagged
          ? "Job posted and flagged for review."
          : "Job posted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create job:", error);

    return NextResponse.json(
      {
        error: "Failed to create job. Please try again.",
      },
      { status: 500 }
    );
  }
}