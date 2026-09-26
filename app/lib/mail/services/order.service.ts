import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  orderConfirmationEmail,
} from "../templates/orders/order-confirmation";

import {
  shipmentNotificationEmail,
} from "../templates/orders/shippment-notification";

import {
  deliveryConfirmationEmail,
} from "../templates/orders/delivery-confirmation";

import {
  orderCancellationEmail,
} from "../templates/orders/order-cancellation";

import {
  refundStatusEmail,
} from "../templates/orders/refund-status";

import {
  OrderConfirmationData,
   ShipmentNotificationData,
  ShipmentStatusNotificationData,
  DeliveryConfirmationData,
  OrderCancellationData,
  RefundStatusData,
} from "../types/order.types";

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
) {

    if (!data.email) {
    return;
  }


  const template =
    orderConfirmationEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendShipmentNotificationEmail(
  data: ShipmentNotificationData
) {
  if (!data.email) return;

  const content = shipmentNotificationEmail({
    ...data,
    status: "SHIPPED",
  });

  return sendEmail({
    to: data.email,
    subject: content.subject,
    html: emailLayout(content.html, content.preview),
  });
}


export async function sendShipmentStatusNotificationEmail(
  data: ShipmentStatusNotificationData
) {
  if (!data.email) {
    return;
  }

  const content = shipmentNotificationEmail(data);

  return sendEmail({
    to: data.email,
    subject: content.subject,
    html: emailLayout(
      content.html,
      content.preview
    ),
  });
}

export async function sendDeliveryConfirmationEmail(
  data: DeliveryConfirmationData
) {

  if (!data.email) {
    return;
  }

  const template =
    deliveryConfirmationEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendOrderCancellationEmail(
  data: OrderCancellationData
) {

  if (!data.email) {
    return;
  }

  const template =
    orderCancellationEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendRefundStatusEmail(
  order: any,
  status: "approved" | "rejected",
  reason?: string
) {

  const template =
    refundStatusEmail({
      orderNumber:
        order.orderNumber,

      firstName:
        order.user?.firstName ||
        order.firstName ||
        "Customer",

      email:
        order.user?.email ||
        order.email,

      status,

      reason,
    });

  return sendEmail({
    to:
      order.user?.email ||
      order.email,

    subject:
      template.subject,

    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}