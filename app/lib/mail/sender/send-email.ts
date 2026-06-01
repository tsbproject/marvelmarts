import { resend, DEFAULT_FROM }
from "../config/resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: DEFAULT_FROM,
    to,
    subject,
    html,
  });
}