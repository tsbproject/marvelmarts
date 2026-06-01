import { COLORS } from "../../config/color";
import { AdminTicketData }
  from "../../types/support.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function adminTicketEmail({
  ticketId,
  subject,
  category,
  priority,
  email,
}: AdminTicketData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-weight:900;
        "
      >
        NEW SUPPORT TICKET
      </h1>

      <p>
        A new support request has been
        submitted through MarvelMarts.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:25px;
          border-radius:16px;
          margin-top:20px;
        "
      >

        <p>
          <strong>Ticket:</strong>
          ${ticketId}
        </p>

        <p>
          <strong>User:</strong>
          ${email}
        </p>

        <p>
          <strong>Subject:</strong>
          ${subject}
        </p>

        <p>
          <strong>Category:</strong>
          ${category}
        </p>

        <p>
          <strong>Priority:</strong>
          ${priority}
        </p>

      </div>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/dashboard/admins/support"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Review Ticket
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `New Support Ticket • ${priority}`,

    preview:
      "A new support ticket has been submitted.",

    html,
  };
}