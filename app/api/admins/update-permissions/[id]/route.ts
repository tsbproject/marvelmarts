import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { permissions } = body;
    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json({ error: "Invalid permissions" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { permissions },
      select: { id: true, name: true, email: true, role: true, permissions: true },
    });

    return NextResponse.json({ success: true, admin: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
