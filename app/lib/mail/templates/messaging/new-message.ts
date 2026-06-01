import { COLORS } from "../../config/color";
import { NewMessageData }
  from "../../types/messaging.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function newMessageEmail({
  senderName,
  messageContent,
  conversationId,
}: NewMessageData) {

  const preview =
    messageContent.length > 100
      ? messageContent.substring(0, 100) + "..."
      : messageContent;

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        New Message Received
      </h1>

      <p>
        <strong>${senderName}</strong>
        sent you a message.
      </p>

      <div
        style="
          background:#F9FAFB;
          border:1px solid #E5E7EB;
          border-radius:14px;
          padding:20px;
          margin:25px 0;
          font-style:italic;
        "
      >

        "${preview}"

      </div>

      <div
        style="
          text-align:center;
        "
      >

        <a
          href="${BASE_URL}/account/messages/${conversationId}"
          style="
            background:${COLORS.orange};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          View Conversation
        </a>

      </div>

      <p
        style="
          margin-top:25px;
          color:${COLORS.gray};
          font-size:12px;
        "
      >
        Please do not reply directly
        to this email.
      </p>

    </div>
  `;

  return {
    subject:
      `New Message from ${senderName}`,

    preview:
      `${senderName} sent you a message.`,

    html,
  };
}