import {
  NextRequest,
  NextResponse,
} from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
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

    const updatedOrder =
      await OrderService.updateAdminOrderState(
        id,
        status,
        refundReason,
        session.user.role ===
          "SUPER_ADMIN"
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