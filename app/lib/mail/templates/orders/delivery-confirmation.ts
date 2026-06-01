import { COLORS } from "../../config/color";
import { DeliveryConfirmationData } from "../../types/order.types";

export function deliveryConfirmationEmail(
  order: DeliveryConfirmationData
) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          text-align:center;
        "
      >
        Package Delivered
      </h1>

      <p>
        Hi ${order.firstName},
        your order
        #${order.orderNumber}
        has been delivered.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:20px;
          border-radius:12px;
        "
      >

        <strong>
          Delivery Address
        </strong>

        <p>
          ${order.streetAddress}
          <br />
          ${order.city}
        </p>

      </div>

    </div>
  `;

  return {
    subject:
      `Delivered: ${order.orderNumber}`,

    preview:
      "Your package has been delivered.",

    html,
  };
}