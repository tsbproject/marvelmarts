import { COLORS } from "../../config/color";
import { SupportReceivedData }
  from "../../types/support.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function supportReceivedEmail({
  ticketId,
  subject,
  priority,
}: SupportReceivedData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-weight:900;
          font-style:italic;
        "
      >
        SUPPORT REQUEST RECEIVED
      </h1>

      <p
        style="
          text-align:center;
          color:${COLORS.gray};
        "
      >
        Ticket #${ticketId}
      </p>

      <p>
        Your support request has been
        successfully received.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:25px;
          border-radius:16px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Subject:</strong>
          ${subject}
        </p>

        <p>
          <strong>Priority:</strong>
          ${priority}
        </p>

        <p>
          <strong>Status:</strong>
          OPEN
        </p>

      </div>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/account/support/tickets"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          View Ticket
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `Support Ticket Received • ${ticketId}`,

    preview:
      "Your support request has been received.",

    html,
  };
}