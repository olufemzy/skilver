import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/customer/jobs
 *
 * Returns jobs belonging only to the currently
 * authenticated customer.
 */
export async function GET() {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // 2. Make sure the user is a customer
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          error: "Only customers can access their jobs.",
        },
        { status: 403 }
      );
    }

    // 3. Find the customer's profile
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
        {
          error: "Customer profile not found.",
        },
        { status: 404 }
      );
    }

    // 4. Get the customer's jobs
    const jobs = await prisma.job.findMany({
      where: {
        customerId: customer.id,
      },

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

        contract: {
          select: {
            id: true,
            status: true,
            agreedPrice: true,
            currency: true,
            startDate: true,
            deadline: true,
            completedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("Failed to fetch customer jobs:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch your jobs.",
      },
      { status: 500 }
    );
  }
}