// // middleware.ts
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   console.log("[Middleware] Incoming request:", pathname);

//   // Skip NextAuth API and Next.js internals
//   if (
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/_next/data") ||
//     pathname.startsWith("/_next/") ||
//     pathname === "/favicon.ico"
//   ) {
//     console.log("[Middleware] Skipping internal route:", pathname);
//     return NextResponse.next();
//   }

//   // Define protected routes with allowed roles
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

// // Apply middleware only to protected routes
// export const config = {
//   matcher: ["/dashboard/:path*", "/account/:path*"],
// };






import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  console.log("[Middleware] Incoming request:", pathname);

  // 1. Allow RSC requests (fixes mobile issue) - EXISTING LOGIC
  if (searchParams.has("_rsc")) {
    console.log("[Middleware] Skipping RSC request");
    return NextResponse.next();
  }

  // 2. Skip NextAuth API and Next.js internals - EXISTING LOGIC
  // Added "/maintenance" to the whitelist to prevent redirect loops
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") || 
    pathname.startsWith("/logo.png") || 
    pathname === "/favicon.ico" ||
    pathname === "/maintenance"
  ) {
    console.log("[Middleware] Skipping internal route:", pathname);
    return NextResponse.next();
  }

  // 3. Allow all Authentication routes - EXISTING LOGIC
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // --- START MAINTENANCE LOGIC ---
  // If maintenance is ON, we only allow access if the user is an ADMIN or SUPER_ADMIN
  if (isMaintenanceMode) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const role = token?.role as UserRole | undefined;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    // Redirect to maintenance if NOT an admin and NOT already on an API/Auth path
    if (!isAdmin && !pathname.startsWith("/api")) {
      console.warn("[Middleware] Maintenance Mode Active - Redirecting non-admin");
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }
  // --- END MAINTENANCE LOGIC ---

  // 4. Define protected routes with allowed roles - EXISTING LOGIC
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

  if (!matchedRoute) {
    console.log("[Middleware] No protected route matched, allowing:", pathname);
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("[Middleware] Retrieved token:", token);

    if (!token) {
      console.warn("[Middleware] No token found, redirecting to sign-in");
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    const role = token.role as UserRole | undefined;
    console.log("[Middleware] Role check:", { role, matchedRoute });

    if (!role || !PROTECTED_ROUTES[matchedRoute].includes(role)) {
      console.warn("[Middleware] Access denied:", { role, matchedRoute });
      return NextResponse.redirect(new URL("/auth/access-denied", request.url));
    }

    console.log("[Middleware] Access granted:", { role, matchedRoute });
    return NextResponse.next();
  } catch (err) {
    console.error("[Middleware] Error during token check:", err);
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

// 5. Apply middleware - UPDATED MATCHER
// We must expand the matcher to include the root and shop so maintenance can catch them
export const config = {
  matcher: [
    "/", 
    "/shop/:path*", 
    "/dashboard/:path*", 
    "/account/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Catch-all for maintenance
  ],
};