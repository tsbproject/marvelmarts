import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(req: NextRequest, { token }: { token?: JWT }) {
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Account routes (logged-in users only)
    if (path.startsWith("/account") && !token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};