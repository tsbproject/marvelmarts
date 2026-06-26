import auth, { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { session };
}

export async function requireAdmin() {
  const session = await auth();

  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  ) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function requireVendor() {
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== "VENDOR"
  ) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { session };
}