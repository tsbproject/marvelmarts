import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { finalizeVendorPayout } from "@/app/lib/payouts-calculation";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          PATCH ORDER STATUS                                */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: NextRequest) {
  try {
    await requireManageOrders();

    const body = await req.json();

    const {
      orderId,
      status,
      userId,
    } = body;

    if (!orderId || !status) {
      throw badRequest(
        "Order ID and status are required."
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: String(status).toUpperCase(),
      },
    });

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

/* -------------------------------------------------------------------------- */
/*                         FINALIZE ORDER                                     */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    await requireManageOrders();

    const body = await req.json();

    const {
      orderId,
      newStatus,
    } = body;

    if (!orderId || !newStatus) {
      throw badRequest(
        "Order ID and status are required."
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: String(newStatus).toUpperCase(),
      },
    });

    if (
      String(newStatus).toUpperCase() ===
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