import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import {
  permissionsToAdminProfile,
} from "@/app/lib/auth/admin-permissions";

// Only allow this route in Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Allowed permission keys (must match Permissions type in frontend)
const ALLOWED_PERMISSIONS = [
  "manageAdmins",
  "manageUsers",
  "manageBlogs",
  "manageProducts",
  "manageOrders",
  "manageMessages",
  "manageSettings",
  "manageCategories",
  "manageVendors",
  "manageVerifications",
  "manageSubscribers",
  "manageReviews",
  "manageActivity",
  "manageTrending",
  "manageSupport",
  "managePayout",
] as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN can create other admins
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only SUPER_ADMIN can create admins" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, permissions } = body;

    // Required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields: name, email, password" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password strength (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Validate permissions shape (only allowed keys, boolean values)
    let safePermissions: Record<string, boolean> = {};
    if (permissions && typeof permissions === "object") {
      for (const key of ALLOWED_PERMISSIONS) {
          const value = permissions[key];

          if (typeof value === "boolean") {
            safePermissions[key] = value;
          }
        }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create the new admin
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        roles: ["ADMIN"],
        IsVerified: true,
        adminProfile: {
          create: {
            ...permissionsToAdminProfile(safePermissions),
          },
        },
      },
      include: { adminProfile: true },
    });

    // Optional: Log creation for audit (future-proof)
    console.log(`[Admin Created] By: ${session.user.email} → New Admin: ${newAdmin.email}`);

    // Return sanitized response (no passwordHash)
    const { passwordHash: _, ...safeUser } = newAdmin;

    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admins/create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
