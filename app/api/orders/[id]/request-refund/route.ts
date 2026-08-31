import { NextRequest, NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { badRequest } from "@/app/lib/auth/errors";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiLogging(
  async (
    req: NextRequest,
    { params }: Context
  ) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const { id: orderNumber } =
        await params;

      if (!orderNumber) {
        throw badRequest(
          "Order number is required."
        );
      }

      const { reason } =
        await req.json();

      if (
        !reason ||
        typeof reason !== "string" ||
        reason.trim().length < 10
      ) {
        throw badRequest(
          "Refund reason must be at least 10 characters."
        );
      }

      const updatedOrder =
        await OrderService.requestRefund(
          session.user.id,
          orderNumber,
          reason,
          session.user.name ?? "Customer"
        );

      return NextResponse.json({
        success: true,
        order: {
          ...updatedOrder,
          subtotal: Number(
            updatedOrder.subtotal
          ),
          shipping: Number(
            updatedOrder.shipping
          ),
          tax: Number(updatedOrder.tax),
          total: Number(
            updatedOrder.total
          ),
          items: updatedOrder.items.map(
            (item) => ({
              ...item,
              unitPrice: Number(
                item.unitPrice
              ),
            })
          ),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);