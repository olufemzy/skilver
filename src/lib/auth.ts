import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

type UserRole = "ADMIN" | "CUSTOMER" | "PROVIDER";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Email & Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // Find user in the real database
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        // User does not exist
        if (!user) {
          return null;
        }

        // Prevent inactive or suspended accounts from logging in
        if (!user.isActive || user.isSuspended) {
          return null;
        }

        // Compare entered password with hashed password
        const passwordIsValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordIsValid) {
          return null;
        }

        // Your database uses STUDENT for service providers.
        // The existing application uses PROVIDER for the dashboard role.
        const role: UserRole =
          user.accountType === "STUDENT"
            ? "PROVIDER"
            : user.accountType;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Hash a plaintext password.
 *
 * Used when creating new users during registration.
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
}