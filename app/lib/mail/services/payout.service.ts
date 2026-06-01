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
  email: string,
  data: PayoutStatusData
) {

  const template =
    payoutStatusEmail(data);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}