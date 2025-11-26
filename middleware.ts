// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const pathname = req.nextUrl.pathname;

//   // protect /admin routes
//   if (pathname.startsWith("/admin")) {
//     if (!token || token.role !== "admin") {
//       const url = req.nextUrl.clone();
//       url.pathname = "/auth/sign-in";
//       return NextResponse.redirect(url);
//     }
//   }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };



import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},

  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Admin protection
        if (path.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // User must be logged in for /account
        if (path.startsWith("/account")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};

