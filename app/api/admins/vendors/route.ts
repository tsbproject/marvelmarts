import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Role } from "@prisma/client"; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Roadmap Requirement: Role must be ADMIN 
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Phase 14: Vendor Approval Panel Data [cite: 314]
    const vendors = await prisma.vendor.findMany({
      include: {
        user: { select: { email: true, name: true } },
        // Phase 4: Onboarding Tracker [cite: 147]
        onboarding: true, 
      },
    });

    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}