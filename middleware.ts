import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // --- Admin-only routes ---
    if (path.startsWith("/admin")) {
      if (!token) {
        // Not logged in → send to sign-in
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      }
      if (token.role !== "admin") {
        // Logged in but not admin → send to denied page
        return NextResponse.redirect(new URL("/auth/denied", req.url));
      }
    }

    // --- Account routes (customer/vendor) ---
    if (path.startsWith("/account")) {
      if (!token) {
        // Not logged in → send to sign-in
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      }
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
