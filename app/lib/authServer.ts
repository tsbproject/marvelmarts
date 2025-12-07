import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type AllowedRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

/**
 * Check if the request has a valid session and the user has one of the allowed roles.
 * If not, returns a NextResponse with status 403 (Forbidden).
 * Otherwise, returns the session object for further use.
 */
export async function requireRole(req: Request, allowedRoles: AllowedRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return session;
}
