import { sendEmail } from "../sender/send-email";
import { emailLayout } from "../layouts/email-layout";

import { verificationEmail }
  from "../templates/auth/verification-email";

import { passwordResetEmail }
  from "../templates/auth/password-reset-email";

import {
  VerificationEmailRequest,
  PasswordResetEmailRequest,
} from "../types/auth.types";

export async function sendVerificationEmail({
  email,
  ...templateData
}: VerificationEmailRequest) {

  const template =
    verificationEmail(templateData);

  return sendEmail({
    to: email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}

export async function sendPasswordResetEmail({
  email,
  token,
}: PasswordResetEmailRequest) {

  const template =
    passwordResetEmail({
      token,
    });

  return sendEmail({
    to: email,
    subject: template.subject,
    html: emailLayout(
      template.html,
      template.preview
    ),
  });
}