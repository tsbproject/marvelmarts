import { COLORS } from "../../config/color";
import { VendorActionData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function vendorActionEmail({
  name,
  action,
  reason,
}: VendorActionData) {

  const isRestore =
    action === "RESTORE";

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
        "
      >
        ${
          isRestore
            ? "Account Restored"
            : "Account Status Update"
        }
      </h1>

      <p>
        Hello ${name},
      </p>

      <p>
        ${
          isRestore
            ? "Your vendor account has been restored."
            : "Your vendor account status has changed."
        }
      </p>

      <div
        style="
          background:#F9FAFB;
          border-left:4px solid ${
            isRestore
              ? "#10B981"
              : "#EF4444"
          };
          padding:20px;
          border-radius:10px;
        "
      >

        <strong>
          Admin Note
        </strong>

        <p>
          ${reason}
        </p>

      </div>

    </div>
  `;

  return {
    subject:
      `Vendor Account ${action}`,

    preview:
      "Vendor account update.",

    html,
  };
}