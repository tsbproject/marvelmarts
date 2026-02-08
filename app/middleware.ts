
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";




// export async function middleware(request: NextRequest) {
//   const { pathname, searchParams } = request.nextUrl;
  

//   if (request.nextUrl.searchParams.has("_rsc") || pathname.startsWith("/_next")) {
//   return NextResponse.next();
// }
//   // Force a boolean check. On Vercel, env vars are strings.
//   const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

//   // 1. Instant Static/Internal Whitelist (Fastest Performance)
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/images") ||
//     pathname.startsWith("/logo.png") ||
//     pathname === "/favicon.ico" ||
//     searchParams.has("_rsc")
//   ) {
//     return NextResponse.next();
//   }

//   // 2. Public Route Whitelist (Always allow these unless Maintenance is strictly ON)
//   const isAuthRoute = pathname.startsWith("/auth/");
//   const isMaintenancePage = pathname === "/maintenance";
//   const isPublicRoute = pathname.startsWith("/shop") || pathname.startsWith("/products") || pathname === "/";

//   if (isAuthRoute || isMaintenancePage) {
//     return NextResponse.next();
//   }

//   // 3. Maintenance Logic (Only runs if enabled in Env)
//   if (isMaintenanceMode) {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     const role = token?.role as UserRole | undefined;
//     const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

//     // If maintenance is on, only admins get past this point for non-API routes
//     if (!isAdmin && !pathname.startsWith("/api")) {
//       // Avoid infinite redirect if already on maintenance
//       if (!isMaintenancePage) {
//         return NextResponse.redirect(new URL("/maintenance", request.url));
//       }
//     }
//   }

//   // 4. Protected Dashboard/Account Logic
//   const PROTECTED_ROUTES: Record<string, UserRole[]> = {
//     "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
//     "/account/vendor": [UserRole.VENDOR],
//     "/account/customer": [UserRole.CUSTOMER],
//   };

//   const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
//     pathname === route || pathname.startsWith(`${route}/`)
//   );

//   // If it's not a protected route, it's a public page (Shop/Product/Home) -> Allow it
//   if (!matchedBase) {
//     return NextResponse.next();
//   }

//   // 5. Token Authorization for Protected Routes
//   try {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!token) {
//       const url = new URL("/auth/sign-in", request.url);
//       url.searchParams.set("callbackUrl", pathname); // Handy for redirecting back after login
//       return NextResponse.redirect(url);
//     }

//     const role = token.role as UserRole | undefined;
//     if (!role || !PROTECTED_ROUTES[matchedBase].includes(role)) {
//       return NextResponse.redirect(new URL("/auth/access-denied", request.url));
//     }

//     return NextResponse.next();
//   } catch (err) {
//     return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//   }
// }

// // 6. Refined Matcher (Targeted, not Catch-all)
// // export const config = {
// //   matcher: [
// //     "/",
// //     "/shop/:path*",
// //     "/products/:path*",
// //     "/dashboard/:path*",
// //     "/account/:path*",
// //     "/maintenance"
// //   ],
// // };


// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for:
//      * 1. api (Excludes all API routes from middleware processing)
//      * 2. _next/static, _next/image, favicon.ico, logo.png, images
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico|logo.png|images).*)',
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
    pathname.startsWith("/api/auth") || // Essential for Next-Auth
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
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR],
    "/account/customer": [UserRole.CUSTOMER],
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
      return NextResponse.redirect(url);
    }

    const userRole = token.role as UserRole;
    const allowedRoles = PROTECTED_ROUTES[matchedBase];

    // If role isn't allowed for this section, send to access-denied
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/auth/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. _next/static, _next/image, favicon.ico, logo.png, images
     * We REMOVED 'api' from the exclusion so middleware can verify tokens for API calls
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|images).*)',
  ],
};