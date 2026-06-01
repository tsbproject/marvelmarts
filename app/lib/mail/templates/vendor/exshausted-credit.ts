import { COLORS } from "../../config/color";
import { VendorExhaustedCreditData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function exhaustedCreditEmail({
  firstName,
  storeName,
}: VendorExhaustedCreditData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.red};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        Credits Exhausted
      </h1>

      <p>
        Hello ${firstName},
      </p>

      <p>
        Your store
        <strong>${storeName}</strong>
        has exhausted all available
        boost credits.
      </p>

      <div
        style="
          background:#FEF2F2;
          border-left:4px solid ${COLORS.red};
          padding:20px;
          border-radius:10px;
          margin:25px 0;
        "
      >

        Purchase additional credits
        to continue promoting your
        products.

      </div>

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
          Purchase Credits
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      "Boost Credits Exhausted",

    preview:
      "Your boost credits have been exhausted.",

    html,
  };
}