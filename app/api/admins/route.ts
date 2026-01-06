// app/api/admins/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

type PermissionsShape = Record<string, boolean>;

const DEFAULT_PERMISSIONS: PermissionsShape = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false, // 🔹 newly added
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 🔹 Helper: normalize permissions safely
function normalizePermissions(raw: unknown): PermissionsShape {
  return {
    ...DEFAULT_PERMISSIONS,
    ...(typeof raw === "object" &&
      raw !== null &&
      !Array.isArray(raw)
      ? (raw as Record<string, boolean>)
      : {}),
  };
}

// 🔹 GET: list all admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        adminProfile: { select: { id: true, permissions: true } },
      },
    });

    const normalized = admins.map((u) => ({
      ...u,
      adminProfile: {
        ...u.adminProfile,
        permissions: normalizePermissions(u.adminProfile?.permissions),
      },
    }));

    return NextResponse.json({ admins: normalized }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admins error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🔹 POST: create new admin (SUPER_ADMIN only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Only SUPER_ADMIN can create admins
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const role = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    const permissions: PermissionsShape = body.permissions ?? {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        adminProfile: {
          create: {
            permissions: normalizePermissions(permissions),
          },
        },
      },
      include: { adminProfile: true },
    });

    const normalized = {
      ...user,
      adminProfile: {
        ...user.adminProfile,
        permissions: normalizePermissions(user.adminProfile?.permissions),
      },
    };

    return NextResponse.json({ user: normalized }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admins error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
