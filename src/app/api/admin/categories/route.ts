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

    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        skills: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            skills: true,
            jobs: true,
            services: true,
          },
        },
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can create categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Read request body
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const icon =
      typeof body.icon === "string"
        ? body.icon.trim()
        : null;

    // Validate category name
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Validate slug
    if (!slug) {
      return NextResponse.json(
        { error: "Category slug is required" },
        { status: 400 }
      );
    }

    // Basic slug validation
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingName = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    // Get the next sort order
    const lastCategory = await prisma.category.findFirst({
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const nextSortOrder =
      lastCategory !== null
        ? lastCategory.sortOrder + 1
        : 0;

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        isActive: true,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create category:", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}