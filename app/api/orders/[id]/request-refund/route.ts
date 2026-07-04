import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
  notFound,
  forbidden,
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

    const { reason } = await req.json();

    if (
      !reason ||
      typeof reason !== "string" ||
      reason.trim().length < 10
    ) {
      throw badRequest(
        "Refund reason must be at least 10 characters."
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
    });

    if (!order) {
      throw notFound("Order not found.");
    }

    if (!order.paymentStatus) {
      throw forbidden(
        "Only paid orders can be refunded."
      );
    }

    if (order.refundStatus === "requested") {
      throw badRequest(
        "Refund has already been requested."
      );
    }

    if (order.refundStatus === "approved") {
      throw badRequest(
        "Refund has already been approved."
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        refundStatus: "requested",
        refundReason: reason.trim(),
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

    try {
      await pusherServer.trigger(
        "admin-orders",
        "new-refund-request",
        {
          id: updatedOrder.id,
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          refundStatus: updatedOrder.refundStatus,
          refundReason: updatedOrder.refundReason,
          customerName:
            session.user.name ?? "Customer",
          amount: Number(updatedOrder.total),
          status: updatedOrder.status,
        }
      );
    } catch (error) {
      console.error(
        "PUSHER_REFUND_ERROR:",
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