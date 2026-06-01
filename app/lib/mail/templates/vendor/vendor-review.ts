import { COLORS } from "../../config/color";
import { VendorReviewData }
  from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function vendorReviewEmail({
  firstName,
  storeName,
}: VendorReviewData) {

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
        "
      >
        Documents Received
      </h1>

      <p>
        Hello ${firstName},
      </p>

      <p>
        Verification documents for
        <strong>${storeName}</strong>
        have been received.
      </p>

      <p>
        Our compliance team is currently
        reviewing your submission.
      </p>

      <div
        style="
          background:#F5F9FF;
          border-left:4px solid ${COLORS.navy};
          padding:18px;
          border-radius:10px;
          margin-top:20px;
        "
      >

        Estimated review time:
        <strong>24–48 Hours</strong>

      </div>

      <div
        style="
          margin-top:30px;
          text-align:center;
        "
      >

        <a
          href="${BASE_URL}/account/vendor/verification"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 28px;
            border-radius:10px;
            text-decoration:none;
          "
        >
          Track Status
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      "Documents Under Review",

    preview:
      "Your vendor documents are being reviewed.",

    html,
  };
}