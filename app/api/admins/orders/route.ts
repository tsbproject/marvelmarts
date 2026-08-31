import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (_req: Request) => {
      try {
        await requireManageOrders();

        const orders =
          await OrderService.getAdminOrders();

        return NextResponse.json(
          {
            success: true,
            orders,
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