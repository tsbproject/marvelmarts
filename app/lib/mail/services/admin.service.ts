import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  adminAlertEmail,
} from "../templates/admin/admin-alert";

import {
  adminOrderEmail,
} from "../templates/admin/admin-order";

import {
  AdminAlertData,
  AdminOrderData,
} from "../types/admin.types";

export async function sendAdminAlertEmail(
  admins: string[],
  data: AdminAlertData
) {

  const template =
    adminAlertEmail(data);

  return sendEmail({
    to: admins,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendAdminOrderEmail(
  admins: string[],
  data: AdminOrderData
) {

  const template =
    adminOrderEmail(data);

  return sendEmail({
    to: admins,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}