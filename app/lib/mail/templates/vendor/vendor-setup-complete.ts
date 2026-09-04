import { COLORS } from "../../config/color";
import { VendorSetupCompleteData } from "../../types/vendor.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function vendorSetupCompleteEmail({
  firstName,
  storeName,
}: VendorSetupCompleteData) {
  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
        "
      >
        You're ready,
        ${firstName}!
      </h1>

      <p>
        Your MarvelMarts store
        <strong>${storeName}</strong>
        has completed the required store setup and payout configuration.
      </p>

      <p>
        You are now qualified to create and publish your first product
        on MarvelMarts.
      </p>

      <div
        style="
          margin:28px 0;
          padding:22px;
          background:#f7f9fc;
          border-radius:12px;
          border:1px solid #e5e7eb;
        "
      >

        <h2
          style="
            color:${COLORS.navy};
            font-size:18px;
            margin:0 0 14px;
          "
        >
          Before you publish
        </h2>

        <ul
          style="
            padding-left:20px;
            margin:0;
            color:#374151;
            line-height:1.8;
          "
        >
          <li>Use clear and accurate product information.</li>
          <li>Upload high-quality product images.</li>
          <li>Set your price and available stock carefully.</li>
          <li>Provide accurate product descriptions and details.</li>
          <li>Review your product information before publishing.</li>
        </ul>

      </div>

      <p>
        Once your first product is created and published, customers will
        be able to discover your products through the MarvelMarts
        marketplace.
      </p>

      <div
        style="
          margin:28px 0;
          padding:22px;
          background:#fffaf0;
          border-radius:12px;
          border:1px solid #f1dfb5;
        "
      >

        <h2
          style="
            color:${COLORS.navy};
            font-size:18px;
            margin:0 0 12px;
          "
        >
          Important
        </h2>

        <p
          style="
            margin:0;
            color:#4b5563;
            line-height:1.7;
          "
        >
          Keep your store information, payout details, product information,
          inventory, and customer communication accurate and up to date.
          Your continued access to MarvelMarts is subject to our marketplace
          policies and vendor requirements.
        </p>

      </div>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/account/vendor"
          style="
            background:${COLORS.navy};
            color:white;
            padding:15px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Continue to Vendor Dashboard
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      "Your MarvelMarts Vendor Setup Is Complete",

    preview:
      "Your store setup is complete. You're ready to create your first product.",

    html,
  };
}