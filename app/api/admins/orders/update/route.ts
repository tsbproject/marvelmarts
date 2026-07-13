import { NextRequest, NextResponse } from "next/server";

import { pusherServer } from "@/app/lib/pusherServer";
import { finalizeVendorPayout } from "@/app/lib/payouts-calculation";

import { OrderService } from "@/app/lib/services/order.service";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          PATCH ORDER STATUS                                */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest
) {
  try {
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
          `user-${userId}`,
          "order-update",
          updatedOrder
        );
      } catch (error) {
        console.error(
          "PUSHER_ORDER_UPDATE_ERROR:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        order:
          updatedOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                         FINALIZE ORDER                                     */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest
) {
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
        await finalizeVendorPayout(
          orderId
        );
      } catch (error) {
        console.error(
          "FINALIZE_PAYOUT_ERROR:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        order:
          updatedOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}