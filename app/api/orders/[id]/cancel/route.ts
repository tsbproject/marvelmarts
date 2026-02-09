import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await req.json();

    // 1. Fetch order with items - qty and productId exist here
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const s = order.status.toLowerCase();
    if (["shipped", "delivered", "cancelled"].includes(s)) {
      return NextResponse.json({ error: `Cannot cancel ${s} order.` }, { status: 400 });
    }

    // 2. TRANSACTION: Update Order + Restock Inventory
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // A. Update the order status using your cancelReason field
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          cancelReason: reason || "Customer Cancelled",
        },
      });

      // B. Increment stock for each item using 'qty' and 'stock'
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.qty }, // Matches your schema
            },
          });
        }
      }

      return updated;
    });

    // 3. Notify Admin via Notification Bell System
    try {
      // Trigger for the Admin Notification Bell
      await pusherServer.trigger("admin-notifications", "new-notification", {
        id: Date.now().toString(),
        type: "ORDER_CANCELLED",
        title: "Order Cancelled",
        message: `Order #${updatedOrder.orderNumber} was cancelled by ${session.user.name || "a customer"}.`,
        orderId: updatedOrder.id,
        createdAt: new Date().toISOString(),
      });

      // Existing trigger for the Admin Orders List/Table
      await pusherServer.trigger("admin-orders", "order-cancelled", {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        customerName: session.user.name || "A customer",
        total: Number(updatedOrder.total),
        reason: reason || "No reason provided",
        status: "cancelled"
      });
    } catch (pErr) {
      console.error("Pusher Notification Error:", pErr);
    }

    return NextResponse.json(updatedOrder);

  } catch (error: any) {
    console.error("CANCEL_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}