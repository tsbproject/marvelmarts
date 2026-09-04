import type {
  AdminAlertData,
} from "./mail/types/admin.types";

import type {
  AdminTicketData,
} from "./mail/types/support.types";

import {
  sendAdminAlertEmail,
  sendAdminOrderEmail,
} from "./mail/services/admin.service";

import {
  sendAdminTicketEmail,
} from "./mail/services/support.service";


// AUTH
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./mail/services/auth.service";

// ORDERS
export {
  sendOrderConfirmationEmail,
  sendShipmentNotificationEmail,
  sendDeliveryConfirmationEmail,
  sendOrderCancellationEmail,
  sendRefundStatusEmail,
} from "./mail/services/order.service";

// SUPPORT
export {
  sendSupportReceivedEmail,
  sendSupportProgressEmail,
  sendSupportResolvedEmail,
} from "./mail/services/support.service";

export {
  sendSupportReceivedEmail
    as sendSupportAcknowledgementEmail,
} from "./mail/services/support.service";

// PAYOUTS
export {
  sendPayoutStatusEmail,
} from "./mail/services/payout.service";

// VENDORS
export {
  sendVendorApprovedEmail,
  sendVendorReviewEmail,
  sendVendorStatusEmail,
  sendVendorActionEmail,
  sendVendorSetupCompleteEmail,
  sendCreditPurchaseEmail as sendVendorCreditPurchaseEmail,
  sendLowCreditEmail as sendVendorLowCreditsEmail,
  sendLowCreditEmail as sendVendorLowCreditEmail,
  sendExhaustedCreditEmail as sendVendorExhaustedCreditsEmail,
} from "./mail/services/vendor.service";



export async function sendAdminAlert(
  data: AdminAlertData
) {

  const admins =
    process.env.ADMIN_EMAILS
      ?.split(",")
      .map(email => email.trim())
      .filter(Boolean) || [];

  return sendAdminAlertEmail(
    admins,
    data
  );
}

export async function sendAdminOrderNotification(
  data: any
) {

  const admins =
    process.env.ADMIN_EMAILS
      ?.split(",")
      .map(email => email.trim())
      .filter(Boolean) || [];

  return sendAdminOrderEmail(
    admins,
    data
  );
}

export async function sendAdminSupportNotification(
  data: AdminTicketData
) {

  const admins =
    process.env.ADMIN_EMAILS
      ?.split(",")
      .map(email => email.trim())
      .filter(Boolean) || [];

  return sendAdminTicketEmail(
    admins,
    data
  );
}




