import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export const PATCH =
  withApiLogging(
    async (
      req: Request,
      { params }: Context
    ) => {
      try {
        verifyOrigin(req);

        const session =
          await requireManageOrders();

        const { id } =
          await params;

        const body =
          await req.json();

        const status = String(
          body.status ?? ""
        )
          .trim()
          .toUpperCase();

        const refundReason =
          body.refundReason?.trim() ??
          "Administrative Reversal";

          const trackingNumber =
          body.trackingNumber?.trim() || null;

        const updatedOrder =
          await OrderService.updateAdminOrderState(
            id,
            status,
            refundReason,
            session.user.role ===
              "SUPER_ADMIN",
            trackingNumber
          );

        return NextResponse.json(
          {
            success: true,
            order: {
              ...updatedOrder,
              total: Number(
                updatedOrder.total
              ),
            },
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        return handleApiError(error);
      }
    }
  );