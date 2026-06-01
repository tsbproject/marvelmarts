import { COLORS } from "../../config/color";
import { VendorLowCreditData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function lowCreditEmail({
  firstName,
  storeName,
  currentBalance,
}: VendorLowCreditData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.orange};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        Low Credit Balance
      </h1>

      <p>
        Hello ${firstName},
      </p>

      <p>
        Your store
        <strong>${storeName}</strong>
        is running low on boost credits.
      </p>

      <div
        style="
          background:#FFF7ED;
          border-left:4px solid ${COLORS.orange};
          padding:20px;
          border-radius:10px;
          margin:25px 0;
        "
      >

        <strong>
          Current Balance:
        </strong>

        ${currentBalance}

      </div>

      <p>
        To keep your products visible
        to buyers, please top up
        your credits.
      </p>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/account/vendor/credits"
          style="
            background:${COLORS.navy};
            color:white;
            padding:14px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Buy Credits
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      "Low Boost Credit Balance",

    preview:
      "Your boost credits are running low.",

    html,
  };
}