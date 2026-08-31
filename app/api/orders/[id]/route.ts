import { NextResponse } from "next/server";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { OrderService } from "@/app/lib/services/order.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const session =
        await requireAuth();

      const { id: orderNumber } =
        await params;

      if (!orderNumber) {
        throw badRequest(
          "Order number is required."
        );
      }

      const order =
        await OrderService.getUserOrderByNumber(
          session.user.id,
          orderNumber
        );

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          subtotal: Number(order.subtotal),
          shipping: Number(order.shipping),
          tax: Number(order.tax),
          total: Number(order.total),
          items: order.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
          })),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);