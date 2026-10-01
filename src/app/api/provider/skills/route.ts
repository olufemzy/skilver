import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can access this resource" },
        { status: 403 }
      );
    }

    const providerProfile =
      await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!providerProfile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    const [skills, providerSkills] =
      await Promise.all([
        prisma.skill.findMany({
          where: {
            isActive: true,
            category: {
              isActive: true,
            },
          },
          orderBy: [
            {
              category: {
                sortOrder: "asc",
              },
            },
            {
              name: "asc",
            },
          ],
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),

        prisma.providerSkill.findMany({
          where: {
            providerId: providerProfile.id,
          },
          include: {
            skill: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: {
            skill: {
              name: "asc",
            },
          },
        }),
      ]);

    return NextResponse.json({
      skills,
      selectedSkills: providerSkills.map(
        (providerSkill) => providerSkill.skill
      ),
    });
  } catch (error) {
    console.error(
      "Failed to fetch provider skills:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch provider skills",
      },
      { status: 500 }
    );
  }
}

/**
 * Add a skill to the logged-in provider
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can manage skills" },
        { status: 403 }
      );
    }

    const providerProfile =
      await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!providerProfile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const skillId =
      typeof body.skillId === "string"
        ? body.skillId.trim()
        : "";

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
      include: {
        category: true,
      },
    });

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    if (!skill.isActive) {
      return NextResponse.json(
        { error: "This skill is currently inactive" },
        { status: 400 }
      );
    }

    if (!skill.category.isActive) {
      return NextResponse.json(
        { error: "This skill's category is currently inactive" },
        { status: 400 }
      );
    }

    const existingProviderSkill =
      await prisma.providerSkill.findUnique({
        where: {
          providerId_skillId: {
            providerId: providerProfile.id,
            skillId,
          },
        },
      });

    if (existingProviderSkill) {
      return NextResponse.json(
        { error: "You have already added this skill" },
        { status: 409 }
      );
    }

    const providerSkill =
      await prisma.providerSkill.create({
        data: {
          providerId: providerProfile.id,
          skillId,
        },
        include: {
          skill: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json(
      {
        message: "Skill added successfully",
        providerSkill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to add provider skill:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to add provider skill",
      },
      { status: 500 }
    );
  }
}

/**
 * Remove a skill from the logged-in provider
 *
 * Example:
 * DELETE /api/provider/skills?skillId=abc123
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can manage skills" },
        { status: 403 }
      );
    }

    const providerProfile =
      await prisma.providerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!providerProfile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const skillId =
      searchParams.get("skillId")?.trim() || "";

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const providerSkill =
      await prisma.providerSkill.findUnique({
        where: {
          providerId_skillId: {
            providerId: providerProfile.id,
            skillId,
          },
        },
      });

    if (!providerSkill) {
      return NextResponse.json(
        { error: "This skill is not attached to your profile" },
        { status: 404 }
      );
    }

    await prisma.providerSkill.delete({
      where: {
        providerId_skillId: {
          providerId: providerProfile.id,
          skillId,
        },
      },
    });

    return NextResponse.json({
      message: "Skill removed successfully",
    });
  } catch (error) {
    console.error(
      "Failed to remove provider skill:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to remove provider skill",
      },
      { status: 500 }
    );
  }
}