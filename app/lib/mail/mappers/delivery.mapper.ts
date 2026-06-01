export function mapOrderToDeliveryEmail(
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

    city:
      order.city ??
      "",

    streetAddress:
      order.streetAddress ??
      "",
  };
}