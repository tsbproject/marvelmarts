// app/api/admins/vendors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Role } from "@prisma/client"; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAuthorized = session?.user?.role === Role.ADMIN || session?.user?.role === Role.SUPER_ADMIN;
    
    if (!session || !isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: { 
          select: { id: true, email: true, name: true, image: true } 
        },
        onboarding: true,
        store: true,
        score: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Since verificationDoc is a direct field of vendorProfile, it's already included!
    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    console.error("VENDOR_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}