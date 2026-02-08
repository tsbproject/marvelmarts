// app/api/admin/refunds/approve/route.ts
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { orderId } = await req.json();

    // 1. Update the order in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "refunded",
        refundStatus: "approved" 
      },
      include: { items: true } // Include items so the frontend gets the full object
    });

    // 2. Trigger Pusher to update the Customer's UI instantly
    await pusherServer.trigger(
      `user-${updatedOrder.userId}`, 
      "order-update", 
      updatedOrder
    );

    return NextResponse.json({ 
      success: true, 
      message: "Refund approved and customer notified." 
    });
  } catch (error) {
    console.error("Refund Approval Error:", error);
    return NextResponse.json({ error: "Failed to approve refund" }, { status: 500 });
  }
}