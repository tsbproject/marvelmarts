export function mapOrderToRefundEmail(
  order: any,
  status: "approved" | "rejected",
  reason?: string
) {
  return {
    orderNumber:
      order.orderNumber,

    firstName:
      order.firstName ??
      "Customer",

    email:
      order.email ?? "",

    status,

    reason,
  };
}