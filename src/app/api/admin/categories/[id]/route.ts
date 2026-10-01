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
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only ADMIN can update categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check that category exists
    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Read request body
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existingCategory.name;

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : existingCategory.slug;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const icon =
      typeof body.icon === "string"
        ? body.icon.trim()
        : null;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : existingCategory.isActive;

    // Validate name
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

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    // Check duplicate name
    const duplicateName =
      await prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id: categoryId,
          },
        },
      });

    if (duplicateName) {
      return NextResponse.json(
        {
          error:
            "Another category with this name already exists",
        },
        { status: 409 }
      );
    }

    // Check duplicate slug
    const duplicateSlug =
      await prisma.category.findFirst({
        where: {
          slug,
          NOT: {
            id: categoryId,
          },
        },
      });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Another category with this slug already exists",
        },
        { status: 409 }
      );
    }

    // Update category
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        isActive,
      },
    });

    return NextResponse.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Failed to update category:", error);

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}