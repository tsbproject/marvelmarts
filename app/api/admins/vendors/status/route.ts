import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { UserRole } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { vendorId, status } = await req.json();

    // Logic: APPROVED = true, REJECTED (or anything else) = false
    const isApproved = status === "APPROVED";

    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { isVerified: isApproved },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Vendor status updated to ${status}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}