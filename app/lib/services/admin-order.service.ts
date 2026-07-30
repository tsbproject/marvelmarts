import { UserRole } from "@prisma/client";
import { prisma } from "@/app/lib/prisma"
import { PayoutService } from "./payout.service";

 


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
      console.error(
        "[AdminOrderService.updateOrderStatus]",
        error
      );
    }
  }

  return updatedOrder;
}
}



