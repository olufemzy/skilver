import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  _req: NextRequest,
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

    const job = await prisma.job.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },

        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                location: true,
                createdAt: true,
              },
            },
          },
        },

        service: {
          select: {
            id: true,
            title: true,
            startPrice: true,
            maxPrice: true,
            serviceType: true,
            provider: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },

        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },

        applications: {
          select: {
            id: true,
            providerId: true,
            price: true,
            deliveryDays: true,
            status: true,
            createdAt: true,
            provider: {
              select: {
                id: true,
                averageRating: true,
                totalReviews: true,
                jobsCompleted: true,
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
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        contract: {
          select: {
            id: true,
            agreedPrice: true,
            currency: true,
            startDate: true,
            deadline: true,
            status: true,
            submittedAt: true,
            completedAt: true,
          },
        },

        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    /*
     * Only expose applications to the customer who owns the job.
     * Providers should not see other providers' applications.
     */
    const isOwner =
      session.user.role === "CUSTOMER" &&
      job.customer.user.id === session.user.id;

    const isAdmin = session.user.role === "ADMIN";

    const responseJob = {
      ...job,

      applications:
        isOwner || isAdmin
          ? job.applications
          : [],

      currentUser: {
        id: session.user.id,
        role: session.user.role,
        isOwner,
      },
    };

    return NextResponse.json({
      job: responseJob,
    });
  } catch (error) {
    console.error("Failed to fetch job:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch job",
      },
      { status: 500 }
    );
  }
}
