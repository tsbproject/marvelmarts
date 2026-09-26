import { COLORS } from "../../config/color";
import type {
  ShipmentStatusNotificationData,
  ShipmentNotificationStatus,
} from "../../types/order.types";


export function shipmentNotificationEmail(
  order: ShipmentStatusNotificationData
) {
  const statusContent: Record<
    ShipmentNotificationStatus,
    {
      title: string;
      message: string;
      subject: string;
      preview: string;
    }
  > = {
    SHIPPED: {
      title: "Your Package Is On The Way",
      message:
        "Your order has been shipped and is now on its way.",
      subject: `Order Shipped: ${order.orderNumber}`,
      preview: "Your package is on the way.",
    },

    IN_TRANSIT: {
      title: "Your Package Is In Transit",
      message:
        "Your package is currently in transit and moving toward its destination.",
      subject: `Order In Transit: ${order.orderNumber}`,
      preview: "Your package is currently in transit.",
    },

    OUT_FOR_DELIVERY: {
      title: "Your Package Is Out For Delivery",
      message:
        "Your package is out for delivery and should arrive soon.",
      subject: `Out for Delivery: ${order.orderNumber}`,
      preview: "Your package is out for delivery.",
    },
  };

  const content = statusContent[order.status];

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
          font-style:italic;
        "
      >
        ${content.title}
      </h1>

      <p>
        Hello ${order.firstName || "Customer"},
      </p>

      <p>
        ${content.message}
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:30px;
          border-radius:16px;
          text-align:center;
        "
      >

        <p
          style="
            margin:0 0 8px;
            color:#6B7280;
            font-size:14px;
          "
        >
          Tracking Number
        </p>

        <h2
          style="
            color:${COLORS.navy};
            margin:0;
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
    subject: content.subject,
    preview: content.preview,
    html,
  };
}