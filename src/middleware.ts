import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        if (role === "PROVIDER") {
          return NextResponse.redirect(new URL("/provider", req.url));
        }

        if (role === "CUSTOMER") {
          return NextResponse.redirect(new URL("/customer", req.url));
        }

        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Provider routes
    if (pathname.startsWith("/provider")) {
      if (role !== "PROVIDER") {
        if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }

        if (role === "CUSTOMER") {
          return NextResponse.redirect(new URL("/customer", req.url));
        }

        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Customer routes
    if (pathname.startsWith("/customer")) {
      if (role !== "CUSTOMER") {
        if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }

        if (role === "PROVIDER") {
          return NextResponse.redirect(new URL("/provider", req.url));
        }

        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/customer/:path*",
  ],
};