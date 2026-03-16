import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

type PermissionsShape = Record<string, boolean>;

const DEFAULT_PERMISSIONS: PermissionsShape = {
  manageAdmins: false,
  manageUsers: false,
   manageVendors: false,
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

          // 1. Check if user exists
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Check if the user has the right permissions
        const userRole = user.role || "USER"; // Default to a safe low-level role
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);

        if (!isAdmin) {
          return NextResponse.json({ error: "Access denied: Admins only" }, { status: 403 });
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
    console.error("PUT Error:", err);
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

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Step A: Delete associated Products
      // If vendorProfileId is required, we cannot set it to null. 
      // We must remove the products to satisfy database integrity.
      await tx.product.deleteMany({
        where: { vendorProfileId: id },
      });

      // Step B: "Unhook" Orders (Only if userId is optional in your Schema)
      // If your Order schema also requires userId, change this to deleteMany as well.
      await tx.order.updateMany({
        where: { userId: id },
        data: { userId: null }, 
      }).catch(() => {
        console.log("Order update skipped: userId might be required in schema.");
      });

      // Step C: Delete secondary records
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.address.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      await tx.adminProfile.deleteMany({ where: { userId: id } });
      
      // If this admin had a vendor profile, delete that too
      await tx.vendorProfile.deleteMany({ where: { userId: id } });

      // Step D: Finally, delete the User
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Admin and associated data removed" }, { status: 200 });

  } catch (err: any) {
    console.error("MANUAL DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Delete failed: " + (err.message || "Internal Server Error") },
      { status: 500 }
    );
  }
}