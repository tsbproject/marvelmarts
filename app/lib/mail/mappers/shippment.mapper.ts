export function mapOrderToShipmentEmail(
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

    trackingNumber:
      order.trackingNumber ??
      undefined,
  };
}