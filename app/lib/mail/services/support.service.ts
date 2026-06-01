import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  supportReceivedEmail,
} from "../templates/support/support-received";

import {
  supportProgressEmail,
} from "../templates/support/support-progress";

import {
  supportResolvedEmail,
} from "../templates/support/support-resolved";

import {
  adminTicketEmail,
} from "../templates/support/admin-ticket";

import {
  SupportReceivedData,
  SupportProgressData,
  SupportResolvedData,
  AdminTicketData,
} from "../types/support.types";

export async function sendSupportReceivedEmail(
  data: SupportReceivedData
) {

  const template =
    supportReceivedEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendSupportProgressEmail(
  data: SupportProgressData
) {

  const template =
    supportProgressEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendSupportResolvedEmail(
  data: SupportResolvedData
) {

  const template =
    supportResolvedEmail(data);

  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendAdminTicketEmail(
  admins: string[],
  data: AdminTicketData
) {

  const template =
    adminTicketEmail(data);

  return sendEmail({
    to: admins,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}