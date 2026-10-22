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

        contracts: {
          select: {
            id: true,
            providerId: true,
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
     * Get the current provider's application status.
     */
    let applicationStatus: string | null = null;

    if (session.user.role === "PROVIDER") {
      const provider = await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      if (provider) {
        const application = await prisma.application.findUnique({
          where: {
            jobId_providerId: {
              jobId: job.id,
              providerId: provider.id,
            },
          },
          select: {
            status: true,
          },
        });

        applicationStatus = application?.status ?? null;
      }
    }

    /*
    * Identify the actual customer who owns the job record.
    */
    const isOwner =
      session.user.role === "CUSTOMER" &&
      job.customer.user.id === session.user.id;

    const isAdmin = session.user.role === "ADMIN";

    /*
    * Direct service requests are not normal job posts.
    * Their customers must not manage job applications.
    */
    const canReviewApplications = isAdmin || (isOwner && job.service === null);

    let visibleApplications =
      canReviewApplications ? job.applications : [];

    /*
     * Calculate each provider's completed contracts.
     *
     * Do not rely on ProviderProfile.jobsCompleted,
     * because that stored counter may be outdated.
     */
    if (visibleApplications.length > 0) {
      const providerIds = [
        ...new Set(
          visibleApplications.map(
            (application) => application.providerId
          )
        ),
      ];

      const completedContracts = await prisma.contract.groupBy({
        by: ["providerId"],
        where: {
          providerId: {
            in: providerIds,
          },
          status: "COMPLETED",
        },
        _count: {
          _all: true,
        },
      });

      const completedCountByProviderId = new Map(
        completedContracts.map((item) => [
          item.providerId,
          item._count._all,
        ])
      );

      visibleApplications = visibleApplications.map(
        (application) => ({
          ...application,
          provider: {
            ...application.provider,
            jobsCompleted:
              completedCountByProviderId.get(
                application.providerId
              ) ?? 0,
          },
        })
      );
    }

    const responseJob = {
      ...job,

      applications: visibleApplications,

      _count: {
        ...job._count,
        applications: canReviewApplications
          ? job._count.applications
          : 0,
      },

      currentUser: {
        id: session.user.id,
        role: session.user.role,
        isOwner,
        canReviewApplications,
        applicationStatus,
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