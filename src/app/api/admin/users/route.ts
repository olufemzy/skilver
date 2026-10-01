import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const accountType =
      searchParams.get("accountType")?.trim().toUpperCase() || "";
    const status =
      searchParams.get("status")?.trim().toUpperCase() || "";

    const where: any = {};

    // Search by name or email
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Account type filter
    if (
      accountType === "STUDENT" ||
      accountType === "CUSTOMER" ||
      accountType === "ADMIN"
    ) {
      where.accountType = accountType;
    }

    // Status filter
    if (status === "ACTIVE") {
      where.isActive = true;
      where.isSuspended = false;
    }

    if (status === "SUSPENDED") {
      where.isSuspended = true;
    }

    if (status === "INACTIVE") {
      where.isActive = false;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        accountType: true,
        isActive: true,
        isSuspended: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("Failed to fetch admin users:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}