import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
        { error: "Provider access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const serviceType = searchParams.get("serviceType") || "";
    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || 10, 1),
      50
    );

    const where = {
      status: "OPEN" as const,

      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),

      ...(serviceType
        ? {
            serviceType: serviceType as
              | "REMOTE"
              | "PHYSICAL"
              | "BOTH",
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip: (page - 1) * pageSize,
        take: pageSize,

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
              providerId: true,
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
      jobs,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error(
      "Failed to fetch provider jobs:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch available jobs",
      },
      { status: 500 }
    );
  }
}
