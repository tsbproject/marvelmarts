

// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 1. Instant Static/Internal Whitelist
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api/auth") || 
//     pathname.startsWith("/images") ||
//     pathname === "/logo.png" ||
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next();
//   }

//   const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // 2. Maintenance Logic
//   if (isMaintenanceMode && !pathname.startsWith("/api")) {
//     const isAdmin = token?.role === UserRole.ADMIN || token?.role === UserRole.SUPER_ADMIN;
//     if (!isAdmin && pathname !== "/maintenance") {
//       return NextResponse.redirect(new URL("/maintenance", request.url));
//     }
//   }

//   // 3. Protected Dashboard/Account Logic
//   const PROTECTED_ROUTES: Record<string, UserRole[]> = {
//     "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
//     "/account/vendor": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
//     "/account/customer": [UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
//   };

//   const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
//     pathname.startsWith(route)
//   );

//   if (matchedBase) {
//     // FIX 1: Use a standard Redirect for navigation routes
//     if (!token) {
//       const url = new URL("/auth/sign-in", request.url);
//       url.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(url); 
//     }

//     const userRole = token.role as UserRole;
//     const allowedRoles = PROTECTED_ROUTES[matchedBase];

//     // FIX 2: Check if userRole actually exists before checking inclusion
//     if (!userRole || !allowedRoles.includes(userRole)) {
//       return NextResponse.redirect(new URL("/", request.url)); // Redirect to home if role is missing/invalid
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|logo.png|images).*)',
//   ],
// };




import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Instant Static/Internal Whitelist (STAYS THE SAME)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/images") ||
    pathname === "/logo.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 2. Maintenance Logic (STAYS THE SAME)
  // ...

  // 3. Protected Dashboard/Account Logic
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "/account/customer": [UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    // ADD YOUR API PATH HERE IF IT NEEDS PROTECTION
    "/api/vendors": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  };

  const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );

  if (matchedBase) {
    if (!token) {
      // FIX: If it's an API request, return 401 JSON instead of a 302 Redirect
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access" }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // Standard redirect for browser pages
      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as UserRole;
    const allowedRoles = PROTECTED_ROUTES[matchedBase];

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Same logic for API vs Page for Access Denied
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Insufficient Permissions" }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL("/auth/access-denied", request.url));
    }
  }

  return NextResponse.next();
}