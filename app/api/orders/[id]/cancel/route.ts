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
    const { id } = await params;
    const orderNumber = id;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason =
      typeof body?.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : "Customer Cancelled";

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const normalizedStatus = order.status.toLowerCase();

    if (["shipped", "delivered", "cancelled"].includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Cannot cancel ${normalizedStatus} order.` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          cancelReason: reason,
        },
        include: {
          items: true,
          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },
      });

      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.qty },
            },
          });
        }
      }

      return updated;
    });

    try {
      await pusherServer.trigger("admin-notifications", "new-notification", {
        id: Date.now().toString(),
        type: "ORDER_CANCELLED",
        title: "Order Cancelled",
        message: `Order #${updatedOrder.orderNumber} was cancelled by ${session.user.name || "a customer"}.`,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        createdAt: new Date().toISOString(),
      });

      await pusherServer.trigger("admin-orders", "order-cancelled", {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        customerName: session.user.name || "A customer",
        total: Number(updatedOrder.total),
        reason,
        status: "cancelled",
      });
    } catch (pErr) {
      console.error("Pusher Notification Error:", pErr);
    }

    const serializedOrder = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      shipping: Number(updatedOrder.shipping),
      tax: Number(updatedOrder.tax),
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    };

    return NextResponse.json(serializedOrder);
  } catch (error: any) {
    console.error("CANCEL_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}