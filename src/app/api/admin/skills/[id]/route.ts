import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const skillId = params.id;

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const existingSkill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existingSkill.name;

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : existingSkill.slug;

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : existingSkill.categoryId;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : existingSkill.isActive;

    if (!name) {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Skill slug is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const duplicateName =
      await prisma.skill.findFirst({
        where: {
          name,
          NOT: {
            id: skillId,
          },
        },
      });

    if (duplicateName) {
      return NextResponse.json(
        {
          error:
            "Another skill with this name already exists",
        },
        { status: 409 }
      );
    }

    const duplicateSlug =
      await prisma.skill.findFirst({
        where: {
          slug,
          NOT: {
            id: skillId,
          },
        },
      });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Another skill with this slug already exists",
        },
        { status: 409 }
      );
    }

    const skill = await prisma.skill.update({
      where: {
        id: skillId,
      },

      data: {
        name,
        slug,
        categoryId,
        isActive,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    console.error("Failed to update skill:", error);

    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}