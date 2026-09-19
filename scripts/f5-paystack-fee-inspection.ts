import { config } from "dotenv";

config({ path: ".env.local" });

import { PaymentService } from "../app/lib/services/payment.service";

const reference = "ORDER-MARVEL-2026-825045-1789745141496";

async function main() {
  const transaction =
    await PaymentService.verifyTransaction(reference);

  console.log(
    JSON.stringify(
      {
        success: transaction.success,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        gatewayResponse: transaction.gatewayResponse,
        fees: transaction.raw?.fees,
        raw: transaction.raw,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
