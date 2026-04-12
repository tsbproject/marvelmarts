// app/api/admin/orders/update/route.ts

import { NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer"; 
import { prisma } from "@/app/lib/prisma"; 
import { finalizeOrderPayout } from "@/app/lib/finance-logic";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, userId } = body;

    // 1. Update Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // 2. Trigger Real-time update via Pusher Server
    // This matches the "user-{user.id}" channel we set up in the frontend
    await pusherServer.trigger(`user-${userId}`, "order-update", updatedOrder);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Pusher Server Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}



// Example: app/api/admin/orders/update/route.ts
export async function POST(req: Request) {
  const { orderId, newStatus } = await req.json();

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });

  // CRITICAL TRIGGER
  if (newStatus === "DELIVERED") {
    try {
      await finalizeOrderPayout(orderId);
      // notifySuccess logic here...
    } catch (error) {
      console.error("Payout failed but order was delivered:", error);
      // Handle the edge case where the order is delivered but payout failed
    }
  }

  return Response.json(updatedOrder);
}