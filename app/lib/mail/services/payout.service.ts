import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  payoutStatusEmail,
} from "../templates/payout/payout-status";

import {
  PayoutStatusData,
} from "../types/payout.types";

export async function sendPayoutStatusEmail(
  to: string,
  vendorName: string,
  amount: number,
  status: "APPROVED" | "REJECTED",
  remarks?: string
) {

  const template =
    payoutStatusEmail({
      to,
      vendorName,
      amount,
      status,
      remarks,
    });

  return sendEmail({
    to,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}