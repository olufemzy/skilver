// import type { Role } from "@prisma/client";
// import type { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: Role;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     id: string;
//     role: Role;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: Role;
//   }
// }


import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN" | "CUSTOMER" | "PROVIDER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}