// // middleware.ts
// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const token = (req as any).nextauth?.token;
//     const path = req.nextUrl.pathname;

//     // If no token, restrict all protected routes
//     if (!token) {
//       return NextResponse.redirect(new URL("/auth/sign-in", req.url));
//     }

//     // Extract role
//     const role = token.role;

//     // Protect SUPER ADMIN AREA
//     if (path.startsWith("/dashboard/super-admin")) {
//       if (role !== "SUPER_ADMIN") {
//         return NextResponse.redirect(new URL("/auth/denied", req.url));
//       }
//     }

//     // Protect ADMIN AREA
//     if (path.startsWith("/dashboard/admins")) {
//       if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
//         return NextResponse.redirect(new URL("/auth/denied", req.url));
//       }
//     }

//     // Protect VENDOR AREA
//     if (path.startsWith("/account/vendor")) {
//       if (role !== "VENDOR") {
//         return NextResponse.redirect(new URL("/auth/denied", req.url));
//       }
//     }

//     // Protect CUSTOMER AREA
//     if (path.startsWith("/account/customer")) {
//       if (role !== "CUSTOMER") {
//         return NextResponse.redirect(new URL("/auth/denied", req.url));
//       }
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: () => true, // We manually authorize inside the middleware
//     },
//   }
// );

// export const config = {
//   matcher: [
//     "/dashboard/super-admin/:path*",
//     "/dashboard/admins/:path*",
//     "/account/vendor/:path*",
//     "/account/customer/:path*",
//   ],
// };

// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // --- Admin-only routes ---
    if (path.startsWith("/dashboard/admins")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      }
      if (token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/denied", req.url));
      }
    }

    // --- Vendor-only ---
    if (path.startsWith("/account/vendor")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      }
      if (token.role !== "VENDOR") {
        return NextResponse.redirect(new URL("/auth/denied", req.url));
      }
    }

    // --- Customer-only ---
    if (path.startsWith("/account/customer")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      }
      if (token.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/auth/denied", req.url));
      }
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/dashboard/super-admin/:path*",
    "/dashboard/admins/:path*",
    "/account/vendor/:path*",
    "/account/customer/:path*",
  ],
};

