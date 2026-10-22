
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
        { error: "Only providers can view service request history." },
        { status: 403 }
      );
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider profile not found." },
        { status: 404 }
      );
    }

    const requests = await prisma.job.findMany({
      where: {
        serviceRequestStatus: {
          in: ["ACCEPTED", "DECLINED"],
        },
        service: {
          is: { providerId: provider.id },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        service: {
          select: {
            id: true,
            title: true,
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
        contracts: {
          select: {
            id: true,
            status: true,
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error(
      "Failed to fetch service request history:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load service request history." },
      { status: 500 }
    );
  }
}
