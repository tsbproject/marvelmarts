import { COLORS } from "../../config/color";
import { VendorStatusData }
  from "../../types/vendor.types";

export function vendorStatusEmail({
  firstName,
  storeName,
  status,
  reason,
}: VendorStatusData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
        "
      >
        Vendor Account Update
      </h1>

      <p>
        Hello ${firstName},
      </p>

      <p>
        Your store
        <strong>${storeName}</strong>
        status has been updated.
      </p>

      <div
        style="
          background:#F9FAFB;
          padding:20px;
          border-radius:12px;
          margin:20px 0;
        "
      >

        <strong>Status:</strong>
        ${status}

      </div>

      ${
        reason
          ? `
          <div
            style="
              background:#FFF7ED;
              padding:20px;
              border-radius:12px;
            "
          >
            ${reason}
          </div>
        `
          : ""
      }

    </div>
  `;

  return {
    subject: `Vendor Status: ${status}`,
    preview: `Your vendor account status changed.`,
    html,
  };
}