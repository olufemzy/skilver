import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },

        provider: {
          select: {
            id: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                location: true,
              },
            },
          },
        },

        images: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          error: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      service,
    });
  } catch (error) {
    console.error(
      "Failed to fetch service:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch service",
      },
      { status: 500 }
    );
  }
}