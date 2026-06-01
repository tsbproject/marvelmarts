import { COLORS } from "../../config/color";
import { AdminAlertData }
  from "../../types/admin.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function adminAlertEmail({
  type,
  subject,
  details,
}: AdminAlertData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        Admin Alert
      </h1>

      <p>
        A new event requires attention
        in the MarvelMarts control center.
      </p>

      <div
        style="
          background:#F8FAFC;
          padding:24px;
          border-left:4px solid ${COLORS.orange};
          border-radius:12px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Type:</strong>
          ${type}
        </p>

        <p>
          <strong>Subject:</strong>
          ${subject}
        </p>

        <p>
          ${details}
        </p>

      </div>

      <div
        style="
          text-align:center;
        "
      >

        <a
          href="${BASE_URL}/dashboard/admins"
          style="
            background:${COLORS.navy};
            color:white;
            padding:14px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Open Admin Dashboard
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `[ADMIN ALERT] ${type}: ${subject}`,

    preview:
      `New ${type.toLowerCase()} requires attention.`,

    html,
  };
}