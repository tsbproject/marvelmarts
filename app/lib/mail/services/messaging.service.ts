import { sendEmail }
  from "../sender/send-email";

import { emailLayout }
  from "../layouts/email-layout";

import {
  newMessageEmail,
} from "../templates/messaging/new-message";

import {
  NewMessageData,
} from "../types/messaging.types";

export async function sendNewMessageEmail(
  email: string,
  data: NewMessageData
) {

  const template =
    newMessageEmail(data);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}