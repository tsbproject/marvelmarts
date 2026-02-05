


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
  manageCategories: false, 
  manageReview: false, 
  manageSupport: false, 
  manageActivity: false, 
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   GET: Fetch Admin by ID
   ============================================================ */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        adminProfile: {
          ...user.adminProfile,
          permissions: {
            ...DEFAULT_PERMISSIONS,
            ...(user.adminProfile?.permissions as Record<string, boolean> || {}),
          },
        },
      },
    });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ============================================================
   PUT: Update Admin by ID
   ============================================================ */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Protect Super Admins
    if (target.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.role && session.user.role === "SUPER_ADMIN") updateData.role = body.role;
    if (body.password) updateData.passwordHash = await bcrypt.hash(body.password, 10);

    // Use transaction for User + Profile update
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: updateData });
      
      if (body.permissions) {
        await tx.adminProfile.upsert({
          where: { userId: id },
          update: { permissions: body.permissions },
          create: { userId: id, permissions: body.permissions },
        });
      }
      return user;
    });

    return NextResponse.json({ user: result });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
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

    // 1. Auth Guard
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Self-deletion Check
    if (session.user.id === id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    // 3. Execution via Transaction
    await prisma.$transaction(async (tx) => {
      // Step A: "Unhook" Products (Set vendor to null so product isn't deleted)
      await tx.product.updateMany({
        where: { vendorId: id },
        data: { vendorId: null },
      });

      // Step B: "Unhook" Orders (Keep the sales record, remove the user link)
      await tx.order.updateMany({
        where: { userId: id },
        data: { userId: null },
      });

      // Step C: Delete secondary records (Cascade-like behavior for non-essential data)
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.address.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      await tx.adminProfile.deleteMany({ where: { userId: id } });

      // Step D: Finally, delete the User
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Admin removed successfully" }, { status: 200 });

  } catch (err: any) {
    console.error("MANUAL DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Delete failed: " + (err.message || "Internal Server Error") },
      { status: 500 }
    );
  }
}
