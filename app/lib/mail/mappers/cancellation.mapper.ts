export function mapOrderToCancellationEmail(
  order: any
) {
  return {
    orderNumber:
      order.orderNumber,

    firstName:
      order.firstName ??
      "Customer",

    email:
      order.email ?? "",

    reason:
      order.cancelReason ??
      undefined,
  };
}