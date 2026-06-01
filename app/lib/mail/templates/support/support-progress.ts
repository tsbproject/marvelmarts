import { COLORS } from "../../config/color";
import { SupportProgressData }
  from "../../types/support.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function supportProgressEmail({
  ticketId,
  subject,
  status,
  message,
}: SupportProgressData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-weight:900;
        "
      >
        CASE UPDATE
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
        Our support team has provided
        a progress update regarding
        your request.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:25px;
          border-radius:16px;
          margin-top:25px;
        "
      >

        <p>
          <strong>Subject:</strong>
          ${subject}
        </p>

        <p>
          <strong>Status:</strong>
          ${status}
        </p>

      </div>

      <div
        style="
          margin-top:20px;
          background:white;
          border:1px solid #E5E7EB;
          border-radius:16px;
          padding:20px;
        "
      >

        ${message}

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
      `Support Update • ${ticketId}`,

    preview:
      "Your support request has received an update.",

    html,
  };
}