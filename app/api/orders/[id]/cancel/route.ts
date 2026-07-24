import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/app/lib/services/order.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest,} from "@/app/lib/auth/errors";

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

    const updatedOrder =
      await OrderService.cancelOrder(
        session.user.id,
        orderNumber,
        reason,
        session.user.name ?? "Customer"
      );

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