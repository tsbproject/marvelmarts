// app/proxy.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/admins",
  "/dashboard/admins/",
  "/dashboard/admins/**",
  "/account/vendor",
  "/account/vendor/**",
  "/account/customer",
  "/account/customer/**",
];

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) => {
    if (route.endsWith("/**")) {
      const base = route.replace("/**", "");
      return pathname.startsWith(base);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (!isProtected) return NextResponse.next();

  // Get token using next-auth
  const token = await getToken({ req: request });

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const role = token.role as string;

  // Role-based restrictions
  if (pathname.startsWith("/dashboard/admins")) {
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  if (pathname.startsWith("/account/vendor")) {
    if (role !== "VENDOR") {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  if (pathname.startsWith("/account/customer")) {
    if (role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

// Next.js 15 equivalent of middleware matcher
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
