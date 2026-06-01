import { COLORS } from "../../config/color";
import { SupportResolvedData }
  from "../../types/support.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function supportResolvedEmail({
  ticketId,
  subject,
  message,
}: SupportResolvedData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.green};
          text-align:center;
          font-weight:900;
        "
      >
        CASE RESOLVED
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
        successfully resolved.
      </p>

      <div
        style="
          background:#F0FDF4;
          border-left:4px solid ${COLORS.green};
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
          RESOLVED
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
          href="${BASE_URL}/contact-us"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Contact Support
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `Support Case Resolved • ${ticketId}`,

    preview:
      "Your support request has been resolved.",

    html,
  };
}