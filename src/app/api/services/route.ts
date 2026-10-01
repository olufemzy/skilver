import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const serviceType =
      searchParams.get("serviceType")?.trim().toUpperCase() || "";

    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "12");

    const page =
      Number.isInteger(pageParam) && pageParam > 0
        ? pageParam
        : 1;

    const limit =
      Number.isInteger(limitParam) &&
      limitParam > 0 &&
      limitParam <= 50
        ? limitParam
        : 12;

    const minPrice =
      minPriceParam !== null && minPriceParam !== ""
        ? Number(minPriceParam)
        : null;

    const maxPrice =
      maxPriceParam !== null && maxPriceParam !== ""
        ? Number(maxPriceParam)
        : null;

    const where: any = {
      isActive: true,

      provider: {
        user: {
          isActive: true,
          isSuspended: false,
        },
      },
    };

    // Search service title and description
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

    // Category filter
    if (category) {
      where.category = {
        slug: category,
        isActive: true,
      };
    } else {
      where.category = {
        isActive: true,
      };
    }

    // Service type filter
    if (
      serviceType === "REMOTE" ||
      serviceType === "PHYSICAL"
    ) {
      where.serviceType = {
        in: [serviceType, "BOTH"],
      };
    }

    // Minimum price
    if (minPrice !== null && Number.isFinite(minPrice)) {
      where.startPrice = {
        gte: minPrice,
      };
    }

    // Maximum price
    if (maxPrice !== null && Number.isFinite(maxPrice)) {
      where.startPrice = {
        ...(where.startPrice || {}),
        lte: maxPrice,
      };
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,

        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          provider: {
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

          images: true,
        },
      }),

      prisma.service.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      services,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch public services:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}