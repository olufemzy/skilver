import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can view service requests." },
        { status: 403 }
      );
    }

    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider profile not found." },
        { status: 404 }
      );
    }

    const requests = await prisma.job.findMany({
      where: {
        serviceRequestStatus: "PENDING",
        service: {
          is: {
            providerId: provider.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            providerId: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error(
      "Failed to fetch provider service requests:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load service requests." },
      { status: 500 }
    );
  }
}
