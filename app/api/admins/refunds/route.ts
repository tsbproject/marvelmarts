import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

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

type RefundAction =
  | "approved"
  | "rejected";

export const PATCH =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        const session =
      await requireManageOrders();

    const adminRole =
      session.user.roles?.includes(
        UserRole.SUPER_ADMIN
      )
        ? UserRole.SUPER_ADMIN
        : UserRole.ADMIN;

        const body =
          await req.json();

        const action =
          body.action as RefundAction;

        const adminNote =
          body.adminNote?.trim() ??
          "";

        const updatedOrder =
          await OrderService.processOrderRefund(
            body.orderId,
            action,
            adminNote,
            session.user.id,
            adminRole
          );

        if (updatedOrder.userId) {
          try {
            await pusherServer.trigger(
              `user-${updatedOrder.userId}`,
              "order-update",
              {
                orderId:
                  updatedOrder.id,
                status:
                  updatedOrder.status,
                refundStatus:
                  updatedOrder.refundStatus,
                message:
                  `Your refund request for order ${updatedOrder.orderNumber} has been ${action}.`,
              }
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
            order: {
              id: updatedOrder.id,
              status:
                updatedOrder.status,
              refundStatus:
                updatedOrder.refundStatus,
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