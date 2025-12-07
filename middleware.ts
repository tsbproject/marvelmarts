// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// interface AuthToken {
//   role?: "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";
// }

// function requireRole(
//   token: AuthToken | undefined,
//   allowedRoles: string[],
//   req: Request
// ) {
//   if (!token)
//     return NextResponse.redirect(new URL("/auth/sign-in", req.url));

//   if (!allowedRoles.includes(token.role ?? ""))
//     return NextResponse.redirect(new URL("/auth/denied", req.url));
// }

// export default withAuth((req) => {
//   const token = (req as { nextauth?: { token?: AuthToken } }).nextauth?.token;
//   const path = req.nextUrl.pathname;

//   // SUPER ADMIN ONLY ROUTES
//   if (path.startsWith("/dashboard/admins"))
//     return requireRole(token, ["SUPER_ADMIN"], req);

//   if (path.startsWith("/dashboard/super-admin"))
//     return requireRole(token, ["SUPER_ADMIN"], req);

//   // ADMIN ROUTES (ANY Admin level)
//   if (path.startsWith("/dashboard"))
//     return requireRole(token, ["SUPER_ADMIN", "ADMIN"], req);

//   // Vendor
//   if (path.startsWith("/account/vendor"))
//     return requireRole(token, ["VENDOR"], req);

//   // Customer
//   if (path.startsWith("/account/customer"))
//     return requireRole(token, ["CUSTOMER"], req);

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/dashboard/admins/:path*",
//     "/dashboard/super-admin/:path*",
//     "/account/vendor/:path*",
//     "/account/customer/:path*",
//   ],
// };


// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    // No custom logic here — withAuth callbacks below enforce authorized
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // token will be undefined for unauthenticated requests
        if (!token) return false;

        // token.role should be one of: SUPER_ADMIN | ADMIN | VENDOR | CUSTOMER
        const role = (token as any).role as string | undefined;

        // allow server side to decide via route matching too (we return true/false here)
        // by default allow any logged-in user; route-specific restrictions enforced via manual path checks if needed
        return !!role;
      },
    },
  }
);

// route matcher: protect dashboard and account vendor/customer areas
export const config = {
  matcher: [
    "/dashboard/:path*",       // general dashboard (admin + others)
    "/dashboard/admins/:path*",// admin-management (we'll still restrict in UI + optionally server)
    "/account/vendor/:path*",
    "/account/customer/:path*",
  ],
};
