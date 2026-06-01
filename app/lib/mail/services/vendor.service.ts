import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  vendorApprovedEmail,
} from "../templates/vendor/vendor-approved";

import {
  vendorReviewEmail,
} from "../templates/vendor/vendor-review";

import {
  vendorActionEmail,
} from "../templates/vendor/vendor-action";

import {
  creditPurchaseEmail,
} from "../templates/vendor/credit-purchase";

import {
  lowCreditEmail,
} from "../templates/vendor/low-credit";

import {
  exhaustedCreditEmail,
} from "../templates/vendor/exshausted-credit";

import {
  VendorApprovalData,
  VendorReviewData,
  VendorActionData,
  VendorCreditPurchaseData,
  VendorLowCreditData,
  VendorExhaustedCreditData,
} from "../types/vendor.types";

export async function sendVendorApprovedEmail(
  data: VendorApprovalData
) {

  const template =
    vendorApprovedEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendVendorReviewEmail(
  data: VendorReviewData
) {

  const template =
    vendorReviewEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendVendorActionEmail(
  data: VendorActionData
) {

  const template =
    vendorActionEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendCreditPurchaseEmail(
  data: VendorCreditPurchaseData
) {

  const template =
    creditPurchaseEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendLowCreditEmail(
  data: VendorLowCreditData
) {

  const template =
    lowCreditEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendExhaustedCreditEmail(
  data: VendorExhaustedCreditData
) {

  const template =
    exhaustedCreditEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}