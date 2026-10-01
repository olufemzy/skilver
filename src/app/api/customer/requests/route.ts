import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can view service requests." },
        { status: 403 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer profile not found." },
        { status: 404 }
      );
    }

    const requests = await prisma.job.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        service: {
          include: {
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
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
          },
        },
      },
    });

    return NextResponse.json({
      requests,
    });
  } catch (error) {
    console.error(
      "Failed to fetch customer requests:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch service requests.",
      },
      { status: 500 }
    );
  }
}