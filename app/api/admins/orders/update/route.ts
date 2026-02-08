// app/api/admin/orders/update/route.ts

import { NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer"; // Ensure this filename exists exactly
import { prisma } from "@/app/lib/prisma"; // Or wherever your DB client is

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