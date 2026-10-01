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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const skills = await prisma.skill.findMany({
      orderBy: {
        name: "asc",
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
      skills,
    });
  } catch (error) {
    console.error("Failed to fetch skills:", error);

    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : "";

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

    const existingName = await prisma.skill.findUnique({
      where: {
        name,
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "A skill with this name already exists" },
        { status: 409 }
      );
    }

    const existingSlug = await prisma.skill.findUnique({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A skill with this slug already exists" },
        { status: 409 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        categoryId,
        isActive: true,
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

    return NextResponse.json(
      {
        message: "Skill created successfully",
        skill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create skill:", error);

    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}