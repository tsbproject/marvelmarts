// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// export async function middleware(request: NextRequest) {
//   const { pathname, searchParams } = request.nextUrl;
//   const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

//   console.log("[Middleware] Incoming request:", pathname);

//   // 1. Allow RSC requests (fixes mobile issue) - EXISTING LOGIC
//   if (searchParams.has("_rsc")) {
//     console.log("[Middleware] Skipping RSC request");
//     return NextResponse.next();
//   }

//   // 2. Skip NextAuth API and Next.js internals - EXISTING LOGIC
//   // Added "/maintenance" to the whitelist to prevent redirect loops
//   if (
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/images") || 
//     pathname.startsWith("/logo.png") || 
//     pathname === "/favicon.ico" ||
//     pathname === "/maintenance"
//   ) {
//     console.log("[Middleware] Skipping internal route:", pathname);
//     return NextResponse.next();
//   }

//   // 3. Allow all Authentication routes - EXISTING LOGIC
//   if (pathname.startsWith("/auth/")) {
//     return NextResponse.next();
//   }

//   // --- START MAINTENANCE LOGIC ---
//   // If maintenance is ON, we only allow access if the user is an ADMIN or SUPER_ADMIN
//   if (isMaintenanceMode) {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     const role = token?.role as UserRole | undefined;
//     const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

//     // Redirect to maintenance if NOT an admin and NOT already on an API/Auth path
//     if (!isAdmin && !pathname.startsWith("/api")) {
//       console.warn("[Middleware] Maintenance Mode Active - Redirecting non-admin");
//       return NextResponse.redirect(new URL("/maintenance", request.url));
//     }
//   }
//   // --- END MAINTENANCE LOGIC ---

//   // 4. Define protected routes with allowed roles - EXISTING LOGIC
//   const PROTECTED_ROUTES: Record<string, UserRole[]> = {
//     "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
//     "/account/vendor": [UserRole.VENDOR],
//     "/account/customer": [UserRole.CUSTOMER],
//   };

//   const matchRoute = (pathname: string, baseRoute: string) =>
//     pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);

//   const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
//     matchRoute(pathname, route)
//   );

//   if (!matchedRoute) {
//     console.log("[Middleware] No protected route matched, allowing:", pathname);
//     return NextResponse.next();
//   }

//   try {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     console.log("[Middleware] Retrieved token:", token);

//     if (!token) {
//       console.warn("[Middleware] No token found, redirecting to sign-in");
//       return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//     }

//     const role = token.role as UserRole | undefined;
//     console.log("[Middleware] Role check:", { role, matchedRoute });

//     if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
//       console.warn("[Middleware] Access denied:", { role, matchedRoute });
//       return NextResponse.redirect(new URL("/auth/access-denied", request.url));
//     }

//     console.log("[Middleware] Access granted:", { role, matchedRoute });
//     return NextResponse.next();
//   } catch (err) {
//     console.error("[Middleware] Error during token check:", err);
//     return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//   }
// }

// // 5. Apply middleware - UPDATED MATCHER
// // We must expand the matcher to include the root and shop so maintenance can catch them
// export const config = {
//   matcher: [
//     "/", 
//     "/shop/:path*", 
//     "/dashboard/:path*", 
//     "/account/:path*",
//     "/((?!api|_next/static|_next/image|favicon.ico).*)", // Catch-all for maintenance
//   ],
// };




import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Force a boolean check. On Vercel, env vars are strings.
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // 1. Instant Static/Internal Whitelist (Fastest Performance)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/logo.png") ||
    pathname === "/favicon.ico" ||
    searchParams.has("_rsc")
  ) {
    return NextResponse.next();
  }

  // 2. Public Route Whitelist (Always allow these unless Maintenance is strictly ON)
  const isAuthRoute = pathname.startsWith("/auth/");
  const isMaintenancePage = pathname === "/maintenance";
  const isPublicRoute = pathname.startsWith("/shop") || pathname.startsWith("/products") || pathname === "/";

  if (isAuthRoute || isMaintenancePage) {
    return NextResponse.next();
  }

  // 3. Maintenance Logic (Only runs if enabled in Env)
  if (isMaintenanceMode) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const role = token?.role as UserRole | undefined;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    // If maintenance is on, only admins get past this point for non-API routes
    if (!isAdmin && !pathname.startsWith("/api")) {
      // Avoid infinite redirect if already on maintenance
      if (!isMaintenancePage) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  }

  // 4. Protected Dashboard/Account Logic
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR],
    "/account/customer": [UserRole.CUSTOMER],
  };

  const matchedBase = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's not a protected route, it's a public page (Shop/Product/Home) -> Allow it
  if (!matchedBase) {
    return NextResponse.next();
  }

  // 5. Token Authorization for Protected Routes
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("callbackUrl", pathname); // Handy for redirecting back after login
      return NextResponse.redirect(url);
    }

    const role = token.role as UserRole | undefined;
    if (!role || !PROTECTED_ROUTES[matchedBase].includes(role)) {
      return NextResponse.redirect(new URL("/auth/access-denied", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

// 6. Refined Matcher (Targeted, not Catch-all)
// export const config = {
//   matcher: [
//     "/",
//     "/shop/:path*",
//     "/products/:path*",
//     "/dashboard/:path*",
//     "/account/:path*",
//     "/maintenance"
//   ],
// };


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (your public images)
     * - shop/products (your public shop pages)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|images|shop|products|favicon.ico|logo.png).*)',
  ],
};