import { COLORS } from "../../config/color";
import { PayoutStatusData }
  from "../../types/payout.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export function payoutStatusEmail({
  vendorName,
  amount,
  status,
  remarks,
}: PayoutStatusData) {

  const isApproved =
    status === "APPROVED";

  const formattedAmount =
    new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
      }
    ).format(amount);

  const html = `
    <div>

      <h1
        style="
          color:${COLORS.navy};
          font-weight:900;
          text-transform:uppercase;
        "
      >
        Payout Request ${status}
      </h1>

      <p>
        Hello
        <strong>${vendorName}</strong>,
      </p>

      <p>
        Your withdrawal request for
        <strong>${formattedAmount}</strong>
        has been reviewed.
      </p>

      <div
        style="
          background:${
            isApproved
              ? "#F0FDF4"
              : "#FEF2F2"
          };

          border-left:4px solid ${
            isApproved
              ? "#10B981"
              : "#EF4444"
          };

          padding:20px;
          border-radius:10px;
          margin:25px 0;
        "
      >

        ${
          isApproved
            ? `
              <strong>
                Status: Approved
              </strong>

              <p>
                Funds have been sent
                to your bank account.
              </p>

              <p>
                Expected arrival:
                24–48 hours.
              </p>
            `
            : `
              <strong>
                Status: Rejected
              </strong>

              <p>
                ${
                  remarks ||
                  "Please contact support for more information."
                }
              </p>
            `
        }

      </div>

      <div
        style="
          text-align:center;
          margin-top:30px;
        "
      >

        <a
          href="${BASE_URL}/account/vendor/payouts"
          style="
            background:${COLORS.navy};
            color:white;
            padding:14px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          View Withdrawal History
        </a>

      </div>

    </div>
  `;

  return {
    subject:
      `Payout ${status}: ${formattedAmount}`,

    preview:
      `Your payout request was ${status.toLowerCase()}.`,

    html,
  };
}