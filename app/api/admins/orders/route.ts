import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import { handleApiError, requireManageOrders  } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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