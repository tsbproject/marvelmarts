import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

interface AuthToken { role?: "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER"; }

function requireRole(token: AuthToken | undefined, allowedRoles: string[], req: Request) {
  if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  if (!allowedRoles.includes(token.role || "")) return NextResponse.redirect(new URL("/auth/denied", req.url));
}

export default withAuth((req) => {
  const token = (req as { nextauth?: { token?: AuthToken } }).nextauth?.token;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard/super-admin")) return requireRole(token, ["SUPER_ADMIN"], req);
  if (path.startsWith("/dashboard/admins")) return requireRole(token, ["SUPER_ADMIN", "ADMIN"], req);
  if (path.startsWith("/account/vendor")) return requireRole(token, ["VENDOR"], req);
  if (path.startsWith("/account/customer")) return requireRole(token, ["CUSTOMER"], req);

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/super-admin/:path*",
    "/dashboard/admins/:path*",
    "/account/vendor/:path*",
    "/account/customer/:path*",
  ],
};
