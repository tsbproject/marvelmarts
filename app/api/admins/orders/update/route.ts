import { NextResponse } from "next/server";

import { pusherServer } from "@/app/lib/pusherServer";
import { PayoutService } from "@/app/lib/services/payout.service";
import { OrderService } from "@/app/lib/services/order.service";
import { logger } from "@/app/lib/logger";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          PATCH ORDER STATUS                                */
/* -------------------------------------------------------------------------- */

export const PATCH =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        await requireManageOrders();

        const {
          orderId,
          status,
          userId,
        } = await req.json();

        const updatedOrder =
          await OrderService.updateOrderStatus(
            orderId,
            status,
            null
          );

        if (userId) {
          try {
            await pusherServer.trigger(
              `user-${userId}-customer`,
              "order-update",
              updatedOrder
            );
          } catch (error) {
            logger.error(
              "PUSHER_ORDER_UPDATE_ERROR:",
              error
            );
          }
        }

        return NextResponse.json(
          {
            success: true,
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

/* -------------------------------------------------------------------------- */
/*                         FINALIZE ORDER                                     */
/* -------------------------------------------------------------------------- */

export const POST =
  withApiLogging(
    async (req: Request) => {
      try {
        await requireManageOrders();

        const {
          orderId,
          newStatus,
        } = await req.json();

        const updatedOrder =
          await OrderService.finalizeOrder(
            orderId,
            newStatus
          );

        if (
          newStatus.toUpperCase() ===
          "DELIVERED"
        ) {
          try {
            await PayoutService.finalizeVendorPayout(
              orderId
            );
          } catch (error) {
            logger.error(
              "FINALIZE_PAYOUT_ERROR:",
              error
            );
          }
        }

        return NextResponse.json(
          {
            success: true,
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
