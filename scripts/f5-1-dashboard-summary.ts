import { config } from "dotenv";

config({ path: ".env.local" });

import FinanceService from "../app/lib/services/finance/finance.service";

async function main() {
  console.log(
    JSON.stringify(
      await FinanceService.getDashboardSummary(),
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
