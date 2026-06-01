import { Order } from "@prisma/client";

export function mapOrderToOrderConfirmationEmail(
  order: any
) {
  return {
    orderNumber:
      order.orderNumber,

    firstName:
      order.firstName ??
      "Customer",

    email:
      order.email ??
      "",

    total:
      Number(order.total),

    items:
      order.items.map((item: any) => ({
        title:
          item.title ??
          "Product",

        qty:
          item.qty,

        unitPrice:
          Number(item.unitPrice),
      })),
  };
}