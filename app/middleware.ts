// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 1. Instant Static/Internal Whitelist
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api/auth") || // Essential for Next-Auth
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
//     "/account/vendor": [UserRole.VENDOR],
//     "/account/customer": [UserRole.CUSTOMER],
//   };

//   // Find if current path starts with any protected base
//   const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
//     pathname.startsWith(route)
//   );

//   // If it's a protected route, check authorization
//   if (matchedBase) {
//     if (!token) {
//       const url = new URL("/auth/sign-in", request.url);
//       url.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(url);
//     }

//     const userRole = token.role as UserRole;
//     const allowedRoles = PROTECTED_ROUTES[matchedBase];

//     // If role isn't allowed for this section, send to access-denied
//     if (!allowedRoles.includes(userRole)) {
//       return NextResponse.redirect(new URL("/auth/access-denied", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for:
//      * 1. _next/static, _next/image, favicon.ico, logo.png, images
//      * We REMOVED 'api' from the exclusion so middleware can verify tokens for API calls
//      */
//     '/((?!_next/static|_next/image|favicon.ico|logo.png|images).*)',
//   ],
// };



import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Instant Static/Internal Whitelist
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/images") ||
    pathname === "/logo.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 2. Maintenance Logic
  if (isMaintenanceMode && !pathname.startsWith("/api")) {
    const isAdmin = token?.role === UserRole.ADMIN || token?.role === UserRole.SUPER_ADMIN;
    if (!isAdmin && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // 3. Protected Dashboard/Account Logic
  // FIXED: Added ADMIN and SUPER_ADMIN to the vendor route so you can manage the store
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "/account/customer": [UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  };

  // Find if current path starts with any protected base
  const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, check authorization
  if (matchedBase) {
  if (!token) {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.json({ redirect: url.toString() }, { status: 302 }); // Better for client transitions
  }

  const userRole = token.role as UserRole;
  const allowedRoles = PROTECTED_ROUTES[matchedBase];

  if (!allowedRoles.includes(userRole)) {
    // BUG FIX: If we just upgraded to VENDOR but token is stale, 
    // instead of a hard redirect to access-denied, let's try to 
    // detect if they are in a "Switching" state.
    
    return NextResponse.redirect(new URL("/auth/access-denied", request.url));
  }
}

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|images).*)',
  ],
};