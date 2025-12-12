import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // ✅ unwrap the Promise
    const { id } = await params;

    const body = await req.json();
    const { permissions } = body;

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { error: "Invalid permissions format" },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.adminProfile.upsert({
      where: { userId: id },
      update: { permissions },
      create: { userId: id, permissions },
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
  } catch (error) {
    console.error("PATCH update-permissions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
