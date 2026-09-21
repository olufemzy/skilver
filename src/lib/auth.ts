// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { db } from "@/lib/db";
// import type { Role } from "@prisma/client";

// export const authOptions: NextAuthOptions = {
//   session: { strategy: "jwt" },
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Email & Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await db.user.findUnique({
//           where: { email: credentials.email.toLowerCase() },
//         });
//         if (!user) return null;
//         if (user.isSuspended) throw new Error("ACCOUNT_SUSPENDED");

//         const valid = await bcrypt.compare(credentials.password, user.passwordHash);
//         if (!valid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = (user as { role: Role }).role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as Role;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// /** Hash a plaintext password for storage at registration time. */
// export async function hashPassword(password: string) {
//   return bcrypt.hash(password, 12);
// }





import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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

        /*
         * TEMPORARY DEVELOPMENT USER
         *
         * This replaces the database lookup while Prisma
         * is temporarily disabled.
         */
        const testUser = {
          id: "dev-user-001",
          email: "admin@test.com",
          password: "123456",
          name: "Test Admin",
          role: "ADMIN" as UserRole,
        };

        if (credentials.email.toLowerCase() !== testUser.email) {
          return null;
        }

        if (credentials.password !== testUser.password) {
          return null;
        }

        return {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
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
 * Kept here because registration will eventually
 * use this when Prisma/database is restored.
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}