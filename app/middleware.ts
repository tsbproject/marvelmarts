// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
 


//   //CRITICAL: allow NextAuth internal routes
//   if (pathname.startsWith("/api/auth")) {
//     return NextResponse.next();
//   }

//   const PROTECTED_ROUTES: Record<string, UserRole[]> = {
//   "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
//   "/account/vendor": [UserRole.VENDOR],
//   "/account/customer": [UserRole.CUSTOMER],
// };


//   // const PROTECTED_ROUTES: Record<string, string[]> = {
//   //   "/dashboard/admins": ["SUPER_ADMIN", "ADMIN"],
//   //   "/account/vendor": ["VENDOR"],
//   //   "/account/customer": ["CUSTOMER"],
//   // };

//   const matchRoute = (pathname: string, baseRoute: string) =>
//     pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);

//   const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
//     matchRoute(pathname, route)
//   );

//   if (!matchedRoute) return NextResponse.next();

//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   if (!token) {
//     return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//   }

//  const role = token.role as UserRole | undefined;


//   if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
//     return NextResponse.redirect(new URL("/access-denied", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/account/:path*"],
// };



// app/proxy.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  //1. Skip NextAuth API and Next.js internal JSON/data requests
  if (
    pathname.startsWith("/api/auth") || // NextAuth API
    pathname.startsWith("/_next/data") || // App Router JSON fetch
    pathname.startsWith("/_next/") || // other Next internals
    pathname === "/favicon.ico" // favicon
  ) {
    return NextResponse.next();
  }

  //Define protected routes with allowed roles
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR],
    "/account/customer": [UserRole.CUSTOMER],
  };

  const matchRoute = (pathname: string, baseRoute: string) =>
    pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    matchRoute(pathname, route)
  );

  //If no matched route, let it pass
  if (!matchedRoute) return NextResponse.next();

  //Get token from cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in -> redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  //Role validation
  const role = token.role as UserRole | undefined;

  if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  //All checks passed -> allow request
  return NextResponse.next();
}

//Apply middleware only to protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
