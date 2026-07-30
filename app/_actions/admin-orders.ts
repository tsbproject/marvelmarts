"use server";

import { AdminOrderService } from "@/app/lib/services/admin-order.service";
import { requireManageOrders } from "@/app/lib/auth/api";

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  const session = await requireManageOrders();

  return AdminOrderService.updateOrderStatus(
    orderId,
    status,
    {
      id: session.user.id,
      email: session.user.email ?? null,
      role: session.user.role,
    }
  );
}