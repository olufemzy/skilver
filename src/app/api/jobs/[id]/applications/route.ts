import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
      select: {
        id: true,
        title: true,
        customerId: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      if (session.user.role !== "CUSTOMER") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      const customer = await prisma.customerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!customer || customer.id !== job.customerId) {
        return NextResponse.json(
          { error: "You do not have access to these applications" },
          { status: 403 }
        );
      }
    }

    const applications = await prisma.application.findMany({
      where: {
        jobId: job.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                location: true,
              },
            },
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      job,
      applications,
      total: applications.length,
    });
  } catch (error) {
    console.error(
      "Failed to fetch job applications:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch applications",
      },
      { status: 500 }
    );
  }
}
