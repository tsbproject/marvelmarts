import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

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

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = context.params;

    const body = await req.json();
    const { permissions } = body;

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { error: "Invalid permissions payload" },
        { status: 400 }
      );
    }

    // Ensure target admin exists
    const target = await prisma.user.findUnique({
      where: { id },
      include: { adminProfile: true },
    });

    if (!target)
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );

    if (!["ADMIN", "SUPER_ADMIN"].includes(target.role)) {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    // Merge with default and update
    const safePermissions = {
      ...DEFAULT_PERMISSIONS,
      ...(permissions as PermissionsShape),
    };

    const updatedProfile = await prisma.adminProfile.upsert({
      where: { userId: id },
      update: { permissions: safePermissions },
      create: { userId: id, permissions: safePermissions },
      include: { user: true },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedProfile.user.id,
        name: updatedProfile.user.name,
        email: updatedProfile.user.email,
        role: updatedProfile.user.role,
        permissions: updatedProfile.permissions,
      },
    });
  } catch (err) {
    console.error("PATCH /api/admins/[id]/permissions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
