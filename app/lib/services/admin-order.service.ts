import { UserRole } from "@prisma/client";
import { prisma } from "@/app/lib/prisma"
import { PayoutService } from "./payout.service";
import { logger } from "@/app/lib/logger";

 


export class AdminOrderService {
  
  static async updateOrderStatus(
  orderId: string,
  status: string,
  actor: {
    id: string;
    email: string | null;
    role: UserRole;
  }
) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  if (status === "DELIVERED") {
    try {
      await PayoutService.finalizeVendorPayout(orderId);
    } catch (error) {
      logger.error(
        "[AdminOrderService.updateOrderStatus]",
        error
      );
    }
  }

  return updatedOrder;
}
}



