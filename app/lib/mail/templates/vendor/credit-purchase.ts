import { COLORS } from "../../config/color";
import { VendorCreditPurchaseData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function creditPurchaseEmail({
  firstName,
  storeName,
  amountAdded,
  newBalance,
}: VendorCreditPurchaseData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
        "
      >
        Credits Added Successfully
      </h1>

      <p>
        Hello ${firstName},
      </p>

      <p>
        Store:
        <strong>${storeName}</strong>
      </p>

      <p>
        Credits Added:
        <strong>${amountAdded}</strong>
      </p>

      <p>
        New Balance:
        <strong>${newBalance}</strong>
      </p>

      <a
        href="${BASE_URL}/account/vendor"
      >
        Open Dashboard
      </a>

    </div>
  `;

  return {
    subject:
      "Boost Credits Added",

    preview:
      "Your credit purchase was successful.",

    html,
  };
}