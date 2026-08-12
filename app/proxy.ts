import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                              ROLE PRIORITY                                 */
/* -------------------------------------------------------------------------- */

/**
 * Used ONLY for deciding the default landing destination.
 *
 * Authorization must never depend on this priority.
 */
const ROLE_PRIORITY: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.VENDOR,
  UserRole.CUSTOMER,
];

/* -------------------------------------------------------------------------- */
/*                           TOKEN ROLE HELPERS                               */
/* -------------------------------------------------------------------------- */

function getUserRoles(
  singleRole: UserRole | undefined,
  multiRoles: UserRole[] | undefined
): UserRole[] {
  /*
   * Prefer the canonical multi-role collection.
   */
  if (multiRoles?.length) {
    return multiRoles;
  }

  /*
   * Backward compatibility for older JWTs that may
   * contain only the legacy single role.
   */
  if (singleRole) {
    return [singleRole];
  }

  return [];
}

/**
 * Determines the preferred role for DEFAULT REDIRECTION only.
 *
 * This must NOT be used for authorization.
 */
function getPreferredRole(
  roles: UserRole[]
): UserRole | undefined {
  return ROLE_PRIORITY.find((role) =>
    roles.includes(role)
  );
}

/* -------------------------------------------------------------------------- */
/*                           DEFAULT REDIRECT                                 */
/* -------------------------------------------------------------------------- */

function getDefaultRedirectByRole(
  role?: UserRole
) {
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

/* -------------------------------------------------------------------------- */
/*                              MIDDLEWARE                                    */
/* -------------------------------------------------------------------------- */

export async function middleware(
  request: NextRequest
) {
  const {
    pathname,
    searchParams,
  } = request.nextUrl;

  /* ------------------------------------------------------------------------ */
  /*                         BYPASS INTERNAL REQUESTS                         */
  /* ------------------------------------------------------------------------ */

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/images") ||
    pathname === "/logo.png" ||
    pathname === "/favicon.ico" ||
    request.headers.get("rsc") === "1" ||
    request.headers.get(
      "next-router-prefetch"
    ) === "1" ||
    request.headers.get(
      "next-router-state-tree"
    )
  ) {
    return NextResponse.next();
  }

  /* ------------------------------------------------------------------------ */
  /*                              TOKEN                                       */
  /* ------------------------------------------------------------------------ */

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const singleRole =
    token?.role as UserRole | undefined;

  const multiRoles =
    token?.roles as UserRole[] | undefined;

  const userRoles = getUserRoles(
    singleRole,
    multiRoles
  );

  /*
   * Preferred role is ONLY used for deciding the
   * user's default landing destination.
   */
  const preferredRole =
    getPreferredRole(userRoles);

  /* ------------------------------------------------------------------------ */
  /*                           LANDING ROUTES                                 */
  /* ------------------------------------------------------------------------ */

  const landingPaths = [
    "/",
    "/account",
    "/dashboard",
    "/home",
  ];

  const authPages = [
    "/auth/sign-in",
    "/signin",
    "/login",
  ];

  const isLandingPath =
    landingPaths.includes(pathname);

  const isAuthPage =
    authPages.includes(pathname);

  if (token && preferredRole) {
    const redirectTo =
      getDefaultRedirectByRole(
        preferredRole
      );

    if (
      isLandingPath &&
      pathname !== redirectTo
    ) {
      return NextResponse.redirect(
        new URL(
          redirectTo,
          request.url
        )
      );
    }

    if (isAuthPage) {
      const hasRedirectIntent =
        searchParams.has("redirect") ||
        searchParams.has("callbackUrl");

      if (
        !hasRedirectIntent &&
        pathname !== redirectTo
      ) {
        return NextResponse.redirect(
          new URL(
            redirectTo,
            request.url
          )
        );
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                           PROTECTED ROUTES                               */
  /* ------------------------------------------------------------------------ */

  const PROTECTED_ROUTES: Record<
    string,
    UserRole[]
  > = {
    "/checkout": [
      UserRole.CUSTOMER,
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],

    "/dashboard/admins": [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
    ],

    "/account/vendor": [
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],

    "/account/customer": [
      UserRole.CUSTOMER,
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],

    "/api/vendors": [
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  };

  const matchedBase =
    Object.keys(
      PROTECTED_ROUTES
    ).find((route) =>
      pathname.startsWith(route)
    );

  /* ------------------------------------------------------------------------ */
  /*                           AUTHORIZATION                                  */
  /* ------------------------------------------------------------------------ */

  if (matchedBase) {
    /*
     * No authenticated role exists.
     */
    if (!token || userRoles.length === 0) {
      if (
        pathname.startsWith("/api")
      ) {
        return NextResponse.json(
          {
            error:
              "Unauthorized access",
          },
          {
            status: 401,
          }
        );
      }

      const url = new URL(
        "/auth/sign-in",
        request.url
      );

      url.searchParams.set(
        "redirect",
        pathname
      );

      return NextResponse.redirect(url);
    }

    const allowedRoles =
      PROTECTED_ROUTES[matchedBase];

    /*
     * IMPORTANT:
     *
     * Authorization is based on ALL roles owned
     * by the account — not the preferred/highest role.
     */
    const hasAllowedRole =
      allowedRoles.some((allowedRole) =>
        userRoles.includes(
          allowedRole
        )
      );

    if (!hasAllowedRole) {
      if (
        pathname.startsWith("/api")
      ) {
        return NextResponse.json(
          {
            error:
              "Forbidden: Insufficient permissions",
          },
          {
            status: 403,
          }
        );
      }

      return NextResponse.redirect(
        new URL(
          "/auth/access-denied",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

/* -------------------------------------------------------------------------- */
/*                               MATCHER                                      */
/* -------------------------------------------------------------------------- */

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