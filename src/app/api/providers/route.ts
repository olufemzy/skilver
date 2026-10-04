import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;

    const query = params.get("q")?.trim() || "";
    const category =
      params.get("category")?.trim().toLowerCase() || "";
    const location = params.get("location")?.trim() || "";

    const verified = params.get("verified") === "true";
    const available = params.get("available") === "true";

    const minRating =
      Number(params.get("minRating")) || 0;

    const minPrice = params.get("minPrice")
      ? Number(params.get("minPrice"))
      : undefined;

    const maxPrice = params.get("maxPrice")
      ? Number(params.get("maxPrice"))
      : undefined;

    const serviceType =
      params.get("serviceType")?.trim().toUpperCase() || "";

    const page = Math.max(
      Number(params.get("page")) || 1,
      1
    );

    const pageSize = 18;

    /*
     * ProviderProfile is the provider record.
     *
     * A provider belongs to a category through:
     *
     * ProviderProfile → Service → Category
     */
    const providerWhere: any = {
      user: {
        isActive: true,
        isSuspended: false,
      },
    };

    /*
     * Verification filter
     */
    if (verified) {
      providerWhere.verificationStatus = "VERIFIED";
    }

    /*
     * Availability filter
     */
    if (available) {
      providerWhere.isAvailable = true;
    }

    /*
     * Location filter
     */
    if (location) {
      providerWhere.user.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    /*
     * Rating filter
     */
    if (minRating > 0) {
      providerWhere.averageRating = {
        gte: minRating,
      };
    }

    /*
     * Search filter
     *
     * Searches provider information, skills,
     * and active services.
     */
    if (query) {
      providerWhere.OR = [
        {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            location: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          university: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          faculty: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          department: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          level: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          skills: {
            some: {
              skill: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
        {
          services: {
            some: {
              isActive: true,
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ];
    }

    /*
     * Service-based filters.
     *
     * Category and price belong to Service,
     * not directly to ProviderProfile.
     */
    const serviceConditions: any = {
      isActive: true,
    };

    if (
      serviceType === "REMOTE" ||
      serviceType === "PHYSICAL"
    ) {
      serviceConditions.serviceType = serviceType;
    }

    if (
      minPrice !== undefined &&
      !Number.isNaN(minPrice)
    ) {
      serviceConditions.startPrice = {
        ...(serviceConditions.startPrice || {}),
        gte: minPrice,
      };
    }

    if (
      maxPrice !== undefined &&
      !Number.isNaN(maxPrice)
    ) {
      serviceConditions.startPrice = {
        ...(serviceConditions.startPrice || {}),
        lte: maxPrice,
      };
    }

    /*
     * Apply category/service/price filters
     * through the provider's active services.
     */
    if (
      category ||
      serviceType === "REMOTE" ||
      serviceType === "PHYSICAL" ||
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      providerWhere.services = {
        some: {
          ...serviceConditions,

          ...(category
            ? {
                category: {
                  slug: category,
                  isActive: true,
                },
              }
            : {}),
        },
      };
    }

    /*
     * Count matching providers
     */
    const total =
      await prisma.providerProfile.count({
        where: providerWhere,
      });

    /*
     * Fetch providers
     */
    const providerProfiles =
      await prisma.providerProfile.findMany({
        where: providerWhere,

        orderBy: [
          {
            averageRating: "desc",
          },
          {
            totalReviews: "desc",
          },
          {
            createdAt: "desc",
          },
        ],

        skip: (page - 1) * pageSize,
        take: pageSize,

        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              location: true,
            },
          },

          skills: {
            include: {
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },

          services: {
            where: {
              isActive: true,
            },

            select: {
              id: true,
              title: true,
              startPrice: true,
              serviceType: true,

              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },

            orderBy: {
              startPrice: "asc",
            },
          },
        },
      });

    /*
     * Format the API response to match
     * ProviderSearchResult used by SearchResults.tsx.
     */
    const data = providerProfiles.map((provider) => {
      const startingPrice =
        provider.services.length > 0
          ? provider.services[0].startPrice
          : null;

      return {
        id: provider.id,

        userId: provider.user.id,

        fullName: provider.user.name,

        profilePhotoUrl:
          provider.user.avatarUrl || null,

        location:
          provider.user.location || null,

        providerType: "STUDENT",

        university:
          provider.university || null,

        department:
          provider.department || null,

        level:
          provider.level || null,

        verificationStatus:
          provider.verificationStatus,

        ratingAvg:
          Number(provider.averageRating) || 0,

        ratingCount:
          provider.totalReviews || 0,

        jobsCompletedCount:
          provider.jobsCompleted || 0,

        isAvailable:
          provider.isAvailable,

        headlineSkills:
          provider.skills.map(
            (providerSkill) =>
              providerSkill.skill.name
          ),

        startingPrice:
          startingPrice !== null
            ? Number(startingPrice)
            : null,
      };
    });

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      hasMore:
        page * pageSize < total,
    });
  } catch (error) {
    console.error(
      "Failed to fetch providers:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch providers",
      },
      {
        status: 500,
      }
    );
  }
}