// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { UserRole } from "@prisma/client";

// const ROLE_PRIORITY: UserRole[] = [
//   UserRole.SUPER_ADMIN,
//   UserRole.ADMIN,
//   UserRole.VENDOR,
//   UserRole.CUSTOMER,
// ];

// // Determine the user's highest-priority role
// function getHighestRole(
//   singleRole: UserRole | undefined,
//   multiRoles: UserRole[] | undefined
// ): UserRole | undefined {

//   // Admin role always wins
//   if (singleRole) return singleRole;

//   // If roles missing, default to CUSTOMER
//   const roles = multiRoles && multiRoles.length > 0
//     ? multiRoles
//     : [UserRole.CUSTOMER];

//   return ROLE_PRIORITY.find((role) => roles.includes(role));
// }

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // ── 1. Skip internal Next.js, static, auth, RSC, and prefetch requests ──
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/images") ||
//     pathname === "/logo.png" ||
//     pathname === "/favicon.ico" ||
//     request.headers.get("rsc") === "1" ||
//     request.headers.get("next-router-prefetch") === "1" ||
//     request.headers.get("next-router-state-tree")
//   ) {
//     return NextResponse.next();
//   }

//   // ── 2. Get session token ──
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const singleRole = token?.role as UserRole | undefined; // admin role
//   const multiRoles = token?.roles as UserRole[] | undefined; // customer/vendor roles
//   const highestRole = getHighestRole(singleRole, multiRoles);

  

//   // ── 3. Landing redirect (skip login pages) ──
//   // const landingPaths = ["/", "/account", "/dashboard", "/home", "/auth/sign-in", "/signin", "/login"];
//   // const landingPaths = ["/", "/account", "/dashboard", "/home"];
//   // const isLandingPath = landingPaths.includes(pathname);

//   // if (token && isLandingPath && highestRole) {
//   //   let redirectTo = "/account/customer"; // default fallback
//   //   switch (highestRole) {
//   //     case UserRole.SUPER_ADMIN:
//   //     case UserRole.ADMIN:
//   //       redirectTo = "/dashboard/admins";
//   //       break;
//   //     case UserRole.VENDOR:
//   //       redirectTo = "/account/vendor";
//   //       break;
//   //     case UserRole.CUSTOMER:
//   //       redirectTo = "/account/customer";
//   //       break;
//   //   }

//   //   if (pathname !== redirectTo) {
//   //     console.log("[Middleware] Landing redirect:", pathname, "→", redirectTo);
//   //     return NextResponse.redirect(new URL(redirectTo, request.url));
//   //   }
//   // }

//   const landingPaths = ["/", "/account", "/dashboard", "/home"];
//     const authPages = ["/auth/sign-in", "/signin", "/login"];

//     const isLandingPath = landingPaths.includes(pathname);
//     const isAuthPage = authPages.includes(pathname);

//     if (token && highestRole) {
//       let redirectTo = "/account/customer";

//       switch (highestRole) {
//         case UserRole.SUPER_ADMIN:
//         case UserRole.ADMIN:
//           redirectTo = "/dashboard/admins";
//           break;
//         case UserRole.VENDOR:
//           redirectTo = "/account/vendor";
//           break;
//         case UserRole.CUSTOMER:
//           redirectTo = "/account/customer";
//           break;
//       }

//       if (isLandingPath && pathname !== redirectTo) {
//         return NextResponse.redirect(new URL(redirectTo, request.url));
//       }

//       if (isAuthPage) {
//         const hasRedirectIntent =
//           request.nextUrl.searchParams.has("redirect") ||
//           request.nextUrl.searchParams.has("callbackUrl");

//         if (!hasRedirectIntent && pathname !== redirectTo) {
//           return NextResponse.redirect(new URL(redirectTo, request.url));
//         }
//       }
//     }

//   // ── 4. Protected routes ──
//   const PROTECTED_ROUTES: Record<string, UserRole[]> = {
//     "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
//     "/account/vendor": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
//     "/account/customer": [UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
//     "/api/vendors": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
//   };

//   const matchedBase = Object.keys(PROTECTED_ROUTES).find((route) => pathname.startsWith(route));

//   if (matchedBase) {
//     if (!highestRole) {
//       // Not logged in
//       if (pathname.startsWith("/api")) {
//         return new NextResponse(JSON.stringify({ error: "Unauthorized access" }), {
//           status: 401,
//           headers: { "content-type": "application/json" },
//         });
//       }
//       const url = new URL("/auth/sign-in", request.url);
//       url.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(url);
//     }

//     const allowedRoles = PROTECTED_ROUTES[matchedBase];
//     if (!allowedRoles.includes(highestRole)) {
//       console.log("[Middleware] Forbidden:", pathname, "HighestRole:", highestRole, "Roles:", multiRoles);
//       if (pathname.startsWith("/api")) {
//         return new NextResponse(JSON.stringify({ error: "Forbidden: Insufficient permissions" }), {
//           status: 403,
//           headers: { "content-type": "application/json" },
//         });
//       }
//       return NextResponse.redirect(new URL("/auth/access-denied", request.url));
//     }
//   }

//   // ── 5. All good → continue ──
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/",
//     "/account/:path*",
//     "/dashboard/:path*",
//     "/api/vendors/:path*",
//     "/auth/callback",
//     "/home",
//     "/signin",
//     "/login",
//   ],
// };



import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

const ROLE_PRIORITY: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.VENDOR,
  UserRole.CUSTOMER,
];

function getHighestRole(
  singleRole: UserRole | undefined,
  multiRoles: UserRole[] | undefined
): UserRole | undefined {
  if (singleRole) return singleRole;

  const roles =
    multiRoles && multiRoles.length > 0
      ? multiRoles
      : [UserRole.CUSTOMER];

  return ROLE_PRIORITY.find((role) => roles.includes(role));
}

function getDefaultRedirectByRole(role?: UserRole) {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return "/dashboard/admins";
    case UserRole.VENDOR:
      return "/account/vendor";
    case UserRole.CUSTOMER:
    default:
      return "/account/customer";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/images") ||
    pathname === "/logo.png" ||
    pathname === "/favicon.ico" ||
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("next-router-state-tree")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const singleRole = token?.role as UserRole | undefined;
  const multiRoles = token?.roles as UserRole[] | undefined;
  const highestRole = getHighestRole(singleRole, multiRoles);

  const landingPaths = ["/", "/account", "/dashboard", "/home"];
  const authPages = ["/auth/sign-in", "/signin", "/login"];

  const isLandingPath = landingPaths.includes(pathname);
  const isAuthPage = authPages.includes(pathname);

  if (token && highestRole) {
    const redirectTo = getDefaultRedirectByRole(highestRole);

    if (isLandingPath && pathname !== redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    if (isAuthPage) {
      const hasRedirectIntent =
        searchParams.has("redirect") || searchParams.has("callbackUrl");

      if (!hasRedirectIntent && pathname !== redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
  }

  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    "/checkout": [
      UserRole.CUSTOMER,
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
    "/dashboard/admins": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/account/vendor": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    "/account/customer": [
      UserRole.CUSTOMER,
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
    "/api/vendors": [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  };

  const matchedBase = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (matchedBase) {
    if (!highestRole) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access" }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          }
        );
      }

      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const allowedRoles = PROTECTED_ROUTES[matchedBase];

    if (!allowedRoles.includes(highestRole)) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Insufficient permissions" }),
          {
            status: 403,
            headers: { "content-type": "application/json" },
          }
        );
      }

      return NextResponse.redirect(new URL("/auth/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/checkout",
    "/account/:path*",
    "/dashboard/:path*",
    "/api/vendors/:path*",
    "/auth/callback",
    "/auth/sign-in",
    "/signin",
    "/login",
    "/home",
  ],
};