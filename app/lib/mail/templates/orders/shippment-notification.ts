import { COLORS } from "../../config/color";
import { ShipmentNotificationData } from "../../types/order.types";

export function shipmentNotificationEmail(
  order: ShipmentNotificationData
) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-style:italic;
        "
      >
        Your Package Is On The Way
      </h1>

      <p>
        Hello ${order.firstName},
        your order has been shipped.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:30px;
          border-radius:16px;
          text-align:center;
        "
      >

        <p>Tracking Number</p>

        <h2
          style="
            color:${COLORS.navy};
          "
        >
          ${
            order.trackingNumber ??
            "Pending Dispatch"
          }
        </h2>

      </div>

    </div>
  `;

  return {
    subject:
      `Order Shipped: ${order.orderNumber}`,

    preview:
      "Your package is on the way.",

    html,
  };
}