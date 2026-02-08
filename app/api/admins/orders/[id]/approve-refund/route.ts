import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { NextRequest, NextResponse } from "next/server";

// Define the context type for Next.js 15+ 
type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  // 1. Await params to prevent Build Error
  const { id } = await context.params;

  try {
    // 2. Get the action from the body ("approved" or "rejected")
    const { action } = await req.json(); 

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // 3. Update Order in Database
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        refundStatus: action,
        // Only set the main order status to 'refunded' if it was approved
        ...(action === "approved" && { status: "refunded" }),
      },
    });

    // 4. Trigger Pusher Sync
    // This makes the update appear on the customer's screen instantly
    await pusherServer.trigger(
      `user-${updatedOrder.userId}`, 
      "order-update", 
      updatedOrder
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("MarvelMarts Refund Process Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}