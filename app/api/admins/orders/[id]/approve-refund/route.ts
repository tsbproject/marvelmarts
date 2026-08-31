import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { logger } from "@/app/lib/logger";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

type RefundAction =
  | "approved"
  | "rejected";

export const PATCH =
  withApiLogging(
    async (
      req: Request,
      { params }: Context
    ) => {
      try {
        verifyOrigin(req);

        await requireManageOrders();

        const { id } =
          await params;

        const body =
          await req.json();

        const action =
          body.action as RefundAction;

        const adminNote =
          body.adminNote?.trim() ||
          "Administrative decision";

        const updatedOrder =
          await OrderService.processRefundRequest(
            id,
            action,
            adminNote
          );

        if (updatedOrder.userId) {
          try {
            await pusherServer.trigger(
              `user-${updatedOrder.userId}`,
              "order-update",
              updatedOrder
            );
          } catch (error) {
            logger.error(
              "PUSHER_REFUND_ERROR:",
              error
            );
          }
        }

        try {
          await sendRefundStatusEmail(
            updatedOrder,
            action,
            adminNote
          );
        } catch (error) {
          logger.error(
            "REFUND_EMAIL_ERROR:",
            error
          );
        }

        return NextResponse.json(
          {
            success: true,
            message:
              `Refund ${action} successfully.`,
            order: updatedOrder,
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