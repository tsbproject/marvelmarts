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






// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  console.log("[Middleware] Incoming request:", pathname);

  // Allow RSC requests (fixes mobile issue)
  if (searchParams.has("_rsc")) {
    console.log("[Middleware] Skipping RSC request");
    return NextResponse.next();
  }

  // Skip NextAuth API and Next.js internals
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") || 
    pathname.startsWith("/logo.png") || 
    pathname === "/favicon.ico"
  ) {
    console.log("[Middleware] Skipping internal route:", pathname);
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Define protected routes with allowed roles
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

// Apply middleware only to protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};

