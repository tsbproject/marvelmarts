import { COLORS } from "../../config/color";
import { RefundStatusData } from "../../types/order.types";

export function refundStatusEmail(
  order: RefundStatusData
) {

  const isApproved =
    order.status === "approved";

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
        "
      >
        Refund ${
          isApproved
            ? "Approved"
            : "Rejected"
        }
      </h1>

      <p>
        Hello ${order.firstName},
      </p>

      <p>
        Your refund request for order
        #${order.orderNumber}
        has been reviewed.
      </p>

      ${
        isApproved
          ? `
            <div
              style="
                background:#F0FDF4;
                padding:20px;
                border-radius:12px;
              "
            >
              Your refund has been approved.
              Funds should arrive within
              3–7 business days.
            </div>
          `
          : `
            <div
              style="
                background:#FEF2F2;
                padding:20px;
                border-radius:12px;
              "
            >
              ${
                order.reason ??
                "Your request did not meet our refund policy requirements."
              }
            </div>
          `
      }

    </div>
  `;

  return {
    subject:
      `Refund Update: ${order.orderNumber}`,

    preview:
      "Update regarding your refund request.",

    html,
  };
}