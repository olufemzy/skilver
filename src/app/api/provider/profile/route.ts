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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        {
          error: "Only providers can access this resource",
        },
        { status: 403 }
      );
    }

    const provider =
      await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },

        select: {
          id: true,

          bio: true,
          university: true,
          faculty: true,
          department: true,
          level: true,
          matricId: true,
          graduationYear: true,

          verificationStatus: true,
          verificationNote: true,
          verifiedAt: true,

          isAvailable: true,

          user: {
            select: {
              name: true,
              email: true,
              location: true,
              avatarUrl: true,
            },
          },
        },
      });

    if (!provider) {
      return NextResponse.json(
        {
          error: "Provider profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: provider,
    });
  } catch (error) {
    console.error(
      "Failed to fetch provider profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch provider profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        {
          error: "Only providers can update this resource",
        },
        { status: 403 }
      );
    }

    const provider =
      await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },

        select: {
          id: true,
        },
      });

    if (!provider) {
      return NextResponse.json(
        {
          error: "Provider profile not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      location,
      bio,
      university,
      faculty,
      department,
      level,
      matricId,
      graduationYear,
      isAvailable,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof bio === "string" &&
      bio.length > 1000
    ) {
      return NextResponse.json(
        {
          error:
            "Bio must be 1000 characters or less",
        },
        { status: 400 }
      );
    }

    if (
      graduationYear !== null &&
      graduationYear !== undefined &&
      (
        !Number.isInteger(graduationYear) ||
        graduationYear < 2000 ||
        graduationYear > 2100
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid graduation year",
        },
        { status: 400 }
      );
    }

    const updatedProfile =
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id: session.user.id,
          },

          data: {
            name: name.trim(),

            location:
              typeof location === "string"
                ? location.trim() || null
                : null,
          },
        });

        await tx.providerProfile.update({
          where: {
            id: provider.id,
          },

          data: {
            bio:
              typeof bio === "string"
                ? bio.trim() || null
                : null,

            university:
              typeof university === "string"
                ? university.trim() || null
                : null,

            faculty:
              typeof faculty === "string"
                ? faculty.trim() || null
                : null,

            department:
              typeof department === "string"
                ? department.trim() || null
                : null,

            level:
              typeof level === "string"
                ? level.trim() || null
                : null,

            matricId:
              typeof matricId === "string"
                ? matricId.trim() || null
                : null,

            graduationYear:
              graduationYear ?? null,

            isAvailable:
              typeof isAvailable === "boolean"
                ? isAvailable
                : true,
          },
        });

        return tx.providerProfile.findUnique({
          where: {
            id: provider.id,
          },

          select: {
            id: true,

            bio: true,
            university: true,
            faculty: true,
            department: true,
            level: true,
            matricId: true,
            graduationYear: true,

            verificationStatus: true,
            verificationNote: true,
            verifiedAt: true,

            isAvailable: true,

            user: {
              select: {
                name: true,
                email: true,
                location: true,
                avatarUrl: true,
              },
            },
          },
        });
      });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(
      "Failed to update provider profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update provider profile",
      },
      { status: 500 }
    );
  }
}