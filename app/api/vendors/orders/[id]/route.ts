import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendShipmentNotificationEmail } from "@/app/lib/mailer"; 

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    const { status, trackingNumber } = await request.json();

    // 1. Authentication Check
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validation
    const normalizedStatus = status?.toUpperCase();
    const validStatuses = ["APPROVED", "REJECTED"];

    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json({ message: "Invalid status update" }, { status: 400 });
    }

    // 3. Authorization Check: Ensure the vendor owns this order
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: { 
        id, 
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 });
    }

    // 4. Execute Update
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status: normalizedStatus.toLowerCase(),
        ...(normalizedStatus === "APPROVED" && trackingNumber && { trackingNumber })
      }
    });

    // 5. Trigger Shipment Email
    // Only send if Approved, has a tracking number, and email hasn't been sent yet
    if (normalizedStatus === "APPROVED" && updatedOrder.trackingNumber && !updatedOrder.emailSent) {
      try {
        await sendShipmentNotificationEmail(updatedOrder);
        
        // Mark as sent in DB
        await prisma.order.update({
          where: { id: updatedOrder.id },
          data: { emailSent: true }
        });
      } catch (mailError) {
        console.error("SHIPMENT_EMAIL_ERROR:", mailError);
        // We don't crash the whole request if the email fails, 
        // but we log it for Tayo to debug.
      }
    }

    return NextResponse.json({
      message: `Order successfully ${normalizedStatus.toLowerCase()}${updatedOrder.emailSent ? ' and customer notified' : ''}`,
      status: updatedOrder.status.toUpperCase(),
      trackingNumber: updatedOrder.trackingNumber
    });

  } catch (error: any) {
    console.error("PATCH_ORDER_ERROR:", error);
    return NextResponse.json(
      { message: error.code === "P2025" ? "Order not found" : "Update failed" },
      { status: 500 }
    );
  }
}