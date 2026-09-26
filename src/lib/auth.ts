import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

type UserRole = "ADMIN" | "CUSTOMER" | "PROVIDER";

const testUsers = [ 
  { 
    id: "dev-admin-001", 
    email: "admin@test.com", 
    password: "12345678", 
    name: "Test Admin", 
    role: "ADMIN" as UserRole, 
  }, 
  { 
    id: "dev-customer-001", 
    email: "customer@test.com", 
    password: "12345678", 
    name: "Test Customer", 
    role: "CUSTOMER" as UserRole, 
  }, 
  { 
    id: "dev-provider-001", 
    email: "provider@test.com", 
    password: "12345678", 
    name: "Test Provider", 
    role: "PROVIDER" as UserRole, 
  }, 
];

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
      credentials: 
        { 
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
          /* * Find the matching development user. */ 
          const testUser = testUsers.find( (user) => user.email === email ); 
          if (!testUser) { 
            return null; 
          } 
        /* * Check the password. 
        * * These are temporary development accounts, 
        * so plaintext comparison is being used here. * * Real users will use bcrypt/database * authentication when Prisma is restored. */ 
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