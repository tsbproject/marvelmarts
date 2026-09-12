import { NotificationContext } from "@prisma/client";
import { COLORS } from "../../config/color";
import { BroadcastEmailData } from "../../types/communications.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function broadcastEmail({
  firstName,
  title,
  message,
  context,
}: BroadcastEmailData) {
  const safeFirstName =
    escapeHtml(firstName?.trim() || "there");

  const safeTitle =
    escapeHtml(title);

  const safeMessage =
    escapeHtml(message).replace(
      /\r?\n/g,
      "<br />"
    );

  const communicationsPath =
    context === NotificationContext.CUSTOMER
      ? "/account/customer/communications"
      : "/account/vendor/communications";

  const html = `
    <div style="text-align:left;">

      <p
        style="
          margin:0 0 18px;
          color:#374151;
          font-size:15px;
        "
      >
        Hello ${safeFirstName},
      </p>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
          margin:0 0 18px;
        "
      >
        ${safeTitle}
      </h1>

      <div
        style="
          background:#F9FAFB;
          border:1px solid #E5E7EB;
          border-radius:14px;
          padding:20px;
          margin:20px 0;
          color:#374151;
          font-size:15px;
          line-height:1.7;
        "
      >
        ${safeMessage}
      </div>

      <div
        style="
          text-align:center;
          margin:28px 0;
        "
      >
        <a
          href="${BASE_URL}${communicationsPath}"
          style="
            background:${COLORS.orange};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
            display:inline-block;
          "
        >
          View Communication
        </a>
      </div>

      <p
        style="
          margin:24px 0 0;
          color:${COLORS.gray};
          font-size:12px;
          line-height:1.7;
        "
      >
        This email is a notification that an important
        MarvelMarts communication is waiting for you
        in your dashboard.
      </p>

    </div>
  `;

  return {
    subject:
      `Important MarvelMarts communication: ${title}`,

    preview:
      `Important MarvelMarts communication: ${title}`,

    html,
  };
}
