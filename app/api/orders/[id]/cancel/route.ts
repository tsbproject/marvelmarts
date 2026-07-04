import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
    const session = await requireAuth();

    const { id: orderNumber } = await params;

    if (!orderNumber) {
      throw badRequest("Order number is required.");
    }

    const body = await req.json().catch(() => ({}));

    const reason =
      typeof body.reason === "string" && body.reason.trim().length
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
      throw notFound("Order not found.");
    }

    const status = order.status.toLowerCase();

    if (status === "cancelled") {
      throw badRequest("Order has already been cancelled.");
    }

    if (status === "delivered") {
      throw forbidden("Delivered orders cannot be cancelled.");
    }

    if (status === "shipped") {
      throw forbidden("Shipped orders cannot be cancelled.");
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "cancelled",
          cancelReason: reason,
        },
        include: {
          items: true,
          vendorProfile: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.variant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                increment: item.qty,
              },
            },
          });
        }

        if (item.productId) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.qty,
              },
              salesCount: {
                decrement: item.qty,
              },
            },
          });
        }
      }

      return updated;
    });

    try {
      await Promise.all([
        pusherServer.trigger(
          "admin-notifications",
          "new-notification",
          {
            id: updatedOrder.id,
            type: "ORDER_CANCELLED",
            title: "Order Cancelled",
            message: `Order #${updatedOrder.orderNumber} was cancelled by ${
              session.user.name ?? "a customer"
            }.`,
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            createdAt: new Date().toISOString(),
          }
        ),

        pusherServer.trigger(
          "admin-orders",
          "order-cancelled",
          {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            customerName:
              session.user.name ?? "Customer",
            total: Number(updatedOrder.total),
            reason,
            status: updatedOrder.status,
          }
        ),
      ]);
    } catch (error) {
      console.error(
        "ORDER_CANCEL_PUSHER_ERROR:",
        error
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        shipping: Number(updatedOrder.shipping),
        tax: Number(updatedOrder.tax),
        total: Number(updatedOrder.total),
        items: updatedOrder.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}