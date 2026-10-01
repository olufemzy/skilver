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

    const services = await prisma.service.findMany({
      where: {
        providerId: providerProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: true,
        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json({
      services,
    });
  } catch (error) {
    console.error(
      "Failed to fetch provider services:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch provider services",
      },
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

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can create services" },
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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : "";

    const startPrice = Number(body.startPrice);

    const maxPrice =
      body.maxPrice !== undefined &&
      body.maxPrice !== null &&
      body.maxPrice !== ""
        ? Number(body.maxPrice)
        : null;

    const currency =
      typeof body.currency === "string"
        ? body.currency.trim().toUpperCase()
        : "NGN";

    const serviceType =
      typeof body.serviceType === "string"
        ? body.serviceType.trim().toUpperCase()
        : "BOTH";

    const deliveryDays =
      body.deliveryDays !== undefined &&
      body.deliveryDays !== null &&
      body.deliveryDays !== ""
        ? Number(body.deliveryDays)
        : null;

    if (!title) {
      return NextResponse.json(
        { error: "Service title is required" },
        { status: 400 }
      );
    }

    if (title.length < 5) {
      return NextResponse.json(
        {
          error:
            "Service title must be at least 5 characters long",
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Service description is required" },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        {
          error:
            "Service description must be at least 20 characters long",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(startPrice) || startPrice < 0) {
      return NextResponse.json(
        { error: "Enter a valid starting price" },
        { status: 400 }
      );
    }

    if (
      maxPrice !== null &&
      (!Number.isFinite(maxPrice) || maxPrice < startPrice)
    ) {
      return NextResponse.json(
        {
          error:
            "Maximum price must be greater than or equal to starting price",
        },
        { status: 400 }
      );
    }

    const validServiceTypes = [
      "REMOTE",
      "PHYSICAL",
      "BOTH",
    ];

    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        {
          error:
            "Service type must be REMOTE, PHYSICAL, or BOTH",
        },
        { status: 400 }
      );
    }

    if (
      deliveryDays !== null &&
      (!Number.isInteger(deliveryDays) || deliveryDays < 1)
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery days must be a positive whole number",
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

    if (!category.isActive) {
      return NextResponse.json(
        { error: "This category is currently inactive" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        providerId: providerProfile.id,
        categoryId,
        title,
        description,
        startPrice,
        maxPrice,
        currency,
        serviceType: serviceType as
          | "REMOTE"
          | "PHYSICAL"
          | "BOTH",
        deliveryDays,
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
        images: true,
      },
    });

    return NextResponse.json(
      {
        message: "Service created successfully",
        service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create provider service:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create provider service",
      },
      { status: 500 }
    );
  }
}