import { NextRequest, NextResponse } from "next/server";
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

/* ============================================================
   GET: Fetch Admin by ID
   ============================================================ */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          ...user,
          adminProfile: {
            ...user.adminProfile,
            permissions: {
              ...DEFAULT_PERMISSIONS,
              ...(user.adminProfile?.permissions ?? {}),
            },
          },
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admins/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ============================================================
   PUT: Update Admin by ID
   ============================================================ */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      role?: "ADMIN" | "SUPER_ADMIN";
      password?: string | null;
      permissions?: PermissionsShape;
    };

    const target = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!target)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (target.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot modify SUPER_ADMIN" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.role && currentUser.role === "SUPER_ADMIN")
      updateData.role = body.role;
    if (body.password)
      updateData.passwordHash = await bcrypt.hash(body.password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (body.permissions) {
      const safePermissions = {
        ...DEFAULT_PERMISSIONS,
        ...body.permissions,
      };

      await prisma.adminProfile.upsert({
        where: { userId: id },
        update: { permissions: safePermissions },
        create: { userId: id, permissions: safePermissions },
      });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/admins/[id] error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE: Remove Admin by ID
   ============================================================ */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id)
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!target)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete SUPER_ADMIN" },
        { status: 403 }
      );
    }

    if (currentUser.role === "ADMIN" && target.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admins can delete only other admins" },
        { status: 403 }
      );
    }

    await prisma.adminProfile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/admins/[id] error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
