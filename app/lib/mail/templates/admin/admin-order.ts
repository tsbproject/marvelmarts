import { COLORS } from "../../config/color";
import { AdminOrderData }
  from "../../types/admin.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function adminOrderEmail(
  order: AdminOrderData
) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        New Sale Secured
      </h1>

      <p>
        Revenue Alert:
        ${order.orderNumber}
      </p>

      <div
        style="
          background:#F8FAFC;
          padding:25px;
          border-radius:16px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Total:</strong>
          ₦${Number(order.total).toLocaleString()}
        </p>

        <p>
          <strong>Payment:</strong>
          ${order.paymentMethod || "PAYSTACK"}
        </p>

      </div>

      <div
        style="
          background:white;
          border:1px solid #E5E7EB;
          border-radius:12px;
          padding:20px;
          margin-bottom:25px;
        "
      >

        <h3>
          Customer
        </h3>

        <p>
          ${order.customerName}
        </p>

        <p>
          ${order.customerEmail}
        </p>

      </div>

      <div
        style="
          background:white;
          border:1px solid #E5E7EB;
          border-radius:12px;
          padding:20px;
        "
      >

        <h3>
          Items Purchased
        </h3>

        ${order.items.map(item => `
          <p>
            ${item.title}
            x${item.qty}
            —
            ₦${(
              item.qty *
              item.unitPrice
            ).toLocaleString()}
          </p>
        `).join("")}

      </div>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/dashboard/admins/orders"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 30px;
            border-radius:12px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Process Order
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `🔥 New Order • ${order.orderNumber}`,

    preview:
      "A new order has been placed.",

    html,
  };
}