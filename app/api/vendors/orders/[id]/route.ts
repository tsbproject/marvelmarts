import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Define params as a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "VENDOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Await the params to get the ID
    const { id } = await params; 
    
    const body = await request.json();
    const { status, trackingNumber } = body;

    // 2. Get Vendor Profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    // 3. Update Order - Ensure it belongs to this vendor
    const updatedOrder = await prisma.order.update({
      where: { 
        id: id,
        vendorProfileId: vendorProfile.id 
      },
      data: {
        status: status.toLowerCase(),
        trackingNumber: trackingNumber || null,
      },
    });

    return NextResponse.json({ message: "Order updated successfully", order: updatedOrder });

  } catch (error: any) {
    console.error("Order Update Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}