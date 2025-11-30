// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//   function middleware() {},

//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const path = req.nextUrl.pathname;

//         // Admin protection
//         if (path.startsWith("/admin")) {
//           return token?.role === "admin";
//         }

//         // User must be logged in for /account
//         if (path.startsWith("/account")) {
//           return !!token;
//         }

//         return true;
//       },
//     },
//   }
// );

// export const config = {
//   matcher: ["/admin/:path*", "/account/:path*"],
// };

import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // You can add logging here if needed
  },

  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // --- PUBLIC ROUTES (no auth needed) ---
        // Add public paths here if needed (e.g., /products, /blog)
        // Example:
        // if (path.startsWith("/public")) return true;

        // --- PROTECTED ROUTES ---

        // 1️⃣ Admin-only routes
        if (path.startsWith("/admin")) {
          if (!token) return false;
          return token.role === "admin";
        }

        // 2️⃣ Logged-in users only
        if (path.startsWith("/account")) {
          return !!token;
        }

        // Allow everything else by default
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
  ],
};
