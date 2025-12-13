// // app/proxy.ts
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export type UnifiedRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

// // ✅ Map of protected routes and allowed roles
// const PROTECTED_ROUTES: Record<string, UnifiedRole[]> = {
//   "/dashboard/admins": ["SUPER_ADMIN", "ADMIN"],
//   "/account/vendor": ["VENDOR"],
//   "/account/customer": ["CUSTOMER"],
// };

// // Helper: check if pathname starts with base route
// const matchRoute = (pathname: string, baseRoute: string) =>
//   pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);

// // ⭐ Required entry point in Next.js 16
// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Check if current path is protected
//   const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
//     matchRoute(pathname, route)
//   );

//   if (!matchedRoute) return NextResponse.next();

//   // Retrieve JWT token from NextAuth
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET, // ✅ ensure secret is passed
//   });

//   if (!token) {
//     // Not authenticated → redirect to login
//     return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//   }

//   const role = token.role as UnifiedRole | undefined;

//   if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
//     // Authenticated but role not allowed → redirect to access denied
//     return NextResponse.redirect(new URL("/access-denied", request.url));
//   }

//   // Authorized → allow request
//   return NextResponse.next();
// }

// // 🟦 Equivalent to middleware matcher
// export const config = {
//   matcher: ["/dashboard/:path*", "/account/:path*"],
// };



import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ CRITICAL: allow NextAuth internal routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const PROTECTED_ROUTES: Record<string, string[]> = {
    "/dashboard/admins": ["SUPER_ADMIN", "ADMIN"],
    "/account/vendor": ["VENDOR"],
    "/account/customer": ["CUSTOMER"],
  };

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

  const role = token.role as string | undefined;

  if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
