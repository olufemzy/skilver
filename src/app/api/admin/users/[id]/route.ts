import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UserAction = "SUSPEND" | "ACTIVATE" | "DEACTIVATE";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can perform user-management actions
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const targetUserId = params.id;

    const body = await request.json();
    const action = body.action as UserAction;

    const validActions: UserAction[] = [
      "SUSPEND",
      "ACTIVATE",
      "DEACTIVATE",
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid user action" },
        { status: 400 }
      );
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        isActive: true,
        isSuspended: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /*
     * IMPORTANT:
     * An administrator cannot suspend or deactivate
     * their own account.
     */
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot suspend or deactivate your own administrator account.",
        },
        { status: 403 }
      );
    }

    /*
     * For now, protect all ADMIN accounts from being
     * suspended or deactivated.
     *
     * We can later introduce SUPER_ADMIN if the platform
     * needs one administrator to manage other administrators.
     */
    if (
      targetUser.accountType === "ADMIN" &&
      (action === "SUSPEND" || action === "DEACTIVATE")
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator accounts cannot be suspended or deactivated.",
        },
        { status: 403 }
      );
    }

    let updateData: {
      isActive?: boolean;
      isSuspended?: boolean;
    };

    switch (action) {
      case "SUSPEND":
        updateData = {
          isActive: true,
          isSuspended: true,
        };
        break;

      case "ACTIVATE":
        updateData = {
          isActive: true,
          isSuspended: false,
        };
        break;

      case "DEACTIVATE":
        updateData = {
          isActive: false,
          isSuspended: false,
        };
        break;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: targetUserId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        isActive: true,
        isSuspended: true,
      },
    });

    return NextResponse.json({
      message: `User ${action.toLowerCase()}d successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update admin user:", error);

    return NextResponse.json(
      {
        error: "Failed to update user",
      },
      { status: 500 }
    );
  }
}