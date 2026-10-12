import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    contractId: string;
  };
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: {
        id: params.contractId,
      },
      select: {
        id: true,
        status: true,
        agreedPrice: true,
        currency: true,
        startDate: true,
        deadline: true,
        workFiles: true,
        workMessage: true,
        submittedAt: true,
        completedAt: true,

        job: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },

        customer: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },

        provider: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    const isCustomer =
      session.user.role === "CUSTOMER" &&
      contract.customer.userId === session.user.id;

    const isProvider =
      session.user.role === "PROVIDER" &&
      contract.provider.userId === session.user.id;

    if (!isCustomer && !isProvider) {
      return NextResponse.json(
        { error: "You are not allowed to access this contract." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      contract: {
        ...contract,
        currentUserRole: isCustomer ? "CUSTOMER" : "PROVIDER",
      },
    });
  } catch (error) {
    console.error("Failed to fetch contract:", error);

    return NextResponse.json(
      { error: "Failed to load contract details." },
      { status: 500 }
    );
  }
}