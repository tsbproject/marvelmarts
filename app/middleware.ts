import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
 


  //CRITICAL: allow NextAuth internal routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "/account/vendor": [UserRole.VENDOR],
  "/account/customer": [UserRole.CUSTOMER],
};


  // const PROTECTED_ROUTES: Record<string, string[]> = {
  //   "/dashboard/admins": ["SUPER_ADMIN", "ADMIN"],
  //   "/account/vendor": ["VENDOR"],
  //   "/account/customer": ["CUSTOMER"],
  // };

  const matchRoute = (pathname: string, baseRoute: string) =>
    pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    matchRoute(pathname, route)
  );

  if (!matchedRoute) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

 const role = token.role as UserRole | undefined;


  if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
