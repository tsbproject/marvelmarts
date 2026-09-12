import { sendEmail } from "../sender/send-email";
import { emailLayout } from "../layouts/email-layout";
import { broadcastEmail } from "../templates/communications/broadcast";
import { BroadcastEmailData } from "../types/communications.types";

export type BroadcastEmailRecipient = {
  email: string;
  name: string | null;
};

const EMAIL_BATCH_SIZE = 20;

export async function sendBroadcastEmails(
  recipients: BroadcastEmailRecipient[],
  data: Omit<BroadcastEmailData, "firstName">
) {
  let sent = 0;
  let failed = 0;

  for (
    let index = 0;
    index < recipients.length;
    index += EMAIL_BATCH_SIZE
  ) {
    const batch =
      recipients.slice(
        index,
        index + EMAIL_BATCH_SIZE
      );

    const results =
      await Promise.allSettled(
        batch.map(({ email, name }) => {
          const template =
            broadcastEmail({
              ...data,
              firstName: name,
            });

          return sendEmail({
            to: email,
            subject: template.subject,
            html: emailLayout(
              template.html,
              template.preview
            ),
          });
        })
      );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent += 1;
      } else {
        failed += 1;

        console.error(
          "[BROADCAST_EMAIL_ERROR]",
          result.reason
        );
      }
    }
  }

  return {
    sent,
    failed,
  };
}
