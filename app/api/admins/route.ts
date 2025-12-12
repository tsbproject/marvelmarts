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
};

export async function GET() {
  try {
    // Return all users with admin roles
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // include adminProfile if exists
        adminProfile: {
          select: { id: true, permissions: true },
        },
      },
    });

    // Normalize permissions so front-end can safely consume
    const normalized = admins.map((u) => ({
  ...u,
  adminProfile: {
    ...u.adminProfile,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...(typeof u.adminProfile?.permissions === "object" &&
         u.adminProfile?.permissions !== null &&
         !Array.isArray(u.adminProfile?.permissions)
        ? (u.adminProfile.permissions as Record<string, boolean>)
        : {}),
    },
  },
}));

    return NextResponse.json({ admins: normalized }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admins error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Only authenticated admin users should create admins
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admins (preferably SUPER_ADMIN) can create — adjust as needed
    if (!(currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const role = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    const permissions: PermissionsShape = body.permissions ?? {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    // Check email uniqueness
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user then adminProfile (user.id used as the canonical id everywhere)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        // ensure adminProfile created and linked to user.id
        adminProfile: {
          create: {
            permissions: { ...DEFAULT_PERMISSIONS, ...permissions },
          },
        },
      },
      include: { adminProfile: true },
    });


    // Normalize and return
      
    const normalized = {
        ...user,
        adminProfile: {
          ...user.adminProfile,
          permissions: {
            ...DEFAULT_PERMISSIONS,
            ...(typeof user.adminProfile?.permissions === "object" &&
              user.adminProfile?.permissions !== null &&
              !Array.isArray(user.adminProfile?.permissions)
              ? (user.adminProfile.permissions as Record<string, boolean>)
              : {}),
          },
        },
      };


    return NextResponse.json({ user: normalized }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admins error:", err);
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}

