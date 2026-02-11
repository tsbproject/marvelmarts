import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Security check for ADIMNS
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}