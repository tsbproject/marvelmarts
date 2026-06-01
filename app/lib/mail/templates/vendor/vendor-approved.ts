import { COLORS } from "../../config/color";
import { VendorApprovalData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function vendorApprovedEmail({
  firstName,
  storeName,
}: VendorApprovalData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
        "
      >
        Congratulations,
        ${firstName}!
      </h1>

      <p>
        Your store
        <strong>${storeName}</strong>
        has been approved.
      </p>

      <p>
        You may now begin selling on
        MarvelMarts.
      </p>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/account/vendor"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Open Dashboard
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      "Store Approved",

    preview:
      "Your vendor account has been approved.",

    html,
  };
}