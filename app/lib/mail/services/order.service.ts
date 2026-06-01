// import { sendEmail } from "../sender/send-email";
// import { emailLayout } from "../layouts/email-layout";

// export async function sendOrderEmail({
//   to,
//   subject,
//   content,
//   preview,
// }: {
//   to: string;
//   subject: string;
//   content: string;
//   preview: string;
// }) {
//   return sendEmail({
//     to,
//     subject,
//     html: emailLayout(content, preview),
//   });
// }



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
  DeliveryConfirmationData,
  OrderCancellationData,
  RefundStatusData,
} from "../types/order.types";

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData
) {

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

  const template =
    shipmentNotificationEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendDeliveryConfirmationEmail(
  data: DeliveryConfirmationData
) {

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
  data: RefundStatusData
) {

  const template =
    refundStatusEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}