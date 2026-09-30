import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AccountType, CustomerType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  location: z.string().optional(),

  accountType: z.enum(["STUDENT", "CUSTOMER"]),

  // Student fields
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  matricId: z.string().optional(),
  graduationYear: z.number().optional(),

  // Customer fields
  customerType: z.enum(["INDIVIDUAL", "BUSINESS"]).optional(),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessDesc: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request data
    const data = schema.parse(body);

    // Normalize email
    const email = data.email.toLowerCase().trim();

    // Validate password
    const passwordError = validatePassword(data.password);

    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user and profile in one transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          password: hashedPassword,
          phone: data.phone.trim(),
          location: data.location?.trim() || null,
          accountType:
            data.accountType === "STUDENT"
              ? AccountType.STUDENT
              : AccountType.CUSTOMER,
        },
      });

      // STUDENT
      if (data.accountType === "STUDENT") {
        await tx.providerProfile.create({
          data: {
            userId: newUser.id,
            university: data.university?.trim() || null,
            faculty: data.faculty?.trim() || null,
            department: data.department?.trim() || null,
            level: data.level?.trim() || null,
            matricId: data.matricId?.trim() || null,
            graduationYear: data.graduationYear || null,

            // Required Json field
            verificationDocs: [],
          },
        });
      }

      // CUSTOMER
      if (data.accountType === "CUSTOMER") {
        await tx.customerProfile.create({
          data: {
            userId: newUser.id,

            customerType:
              data.customerType === "BUSINESS"
                ? CustomerType.BUSINESS
                : CustomerType.INDIVIDUAL,

            businessName: data.businessName?.trim() || null,
            industry: data.industry?.trim() || null,
            businessDesc: data.businessDesc?.trim() || null,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          accountType: user.accountType,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    // Zod validation error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: err.issues[0]?.message || "Invalid registration data",
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", err);

    return NextResponse.json(
      {
        error: "Registration failed",
      },
      { status: 500 }
    );
  }
}