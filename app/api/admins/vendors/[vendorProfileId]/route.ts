import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { vendorProfileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Security Check: Only Admins can access vendor details via this route
    if (!session?.user || (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorProfileId } = params;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: {
        _count: {
          select: { products: true }
        },
        // Include specific profile fields if they are in a separate model
        // vendorProfile: true, 
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("VENDOR_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}