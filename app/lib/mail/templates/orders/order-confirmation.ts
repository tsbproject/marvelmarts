import { COLORS } from "../../config/color";
import { OrderConfirmationData } from "../../types/order.types";

export function orderConfirmationEmail(
  order: OrderConfirmationData
) {
  const html = `
    <div
      style="
        font-family:Helvetica,Arial,sans-serif;
      "
    >

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-style:italic;
          font-weight:900;
        "
      >
        ORDER SECURED
      </h1>

      <p
        style="
          text-align:center;
          color:${COLORS.navy};
          font-weight:700;
        "
      >
        Confirmation #${order.orderNumber}
      </p>

      <p>
        Hi <strong> Hello ${order.firstName || "Customer"},</strong>,
        your order has been successfully received.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:25px;
          border-radius:16px;
          margin:25px 0;
        "
      >

        ${order.items.map(item => `
          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:12px;
            "
          >
            <span>
              ${item.title} x${item.qty}
            </span>

            <strong>
              ₦${(
                item.unitPrice * item.qty
              ).toLocaleString()}
            </strong>
          </div>
        `).join("")}

        <hr />

        <h3
          style="
            color:${COLORS.navy};
            text-align:right;
          "
        >
          ₦${Number(order.total).toLocaleString()}
        </h3>

      </div>

    </div>
  `;

  return {
    subject:
      `Order Secured: ${order.orderNumber}`,

    preview:
      "Thank you for your purchase.",

    html,
  };
}