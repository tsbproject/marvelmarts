import { COLORS } from "../../config/color";
import { OrderCancellationData } from "../../types/order.types";

export function orderCancellationEmail(
  order: OrderCancellationData
) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.red};
          text-align:center;
        "
      >
        Order Cancelled
      </h1>

      <p>
         Hello ${order.firstName || "Customer"},
      </p>

      <p>
        Your order
        <strong>
          #${order.orderNumber}
        </strong>
        has been cancelled.
      </p>

      <div
        style="
          background:#FEF2F2;
          padding:20px;
          border-radius:12px;
          border-left:4px solid ${COLORS.red};
        "
      >

        Refunds typically arrive within
        3–7 business days.

      </div>

    </div>
  `;

  return {
    subject:
      `Order Cancelled: ${order.orderNumber}`,

    preview:
      "Order cancellation confirmation.",

    html,
  };
}