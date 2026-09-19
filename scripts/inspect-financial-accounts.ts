import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== MARVELMARTS FINANCIAL CHART OF ACCOUNTS ===\n");

  const accounts = await prisma.financialAccount.findMany({
    orderBy: [
      { type: "asc" },
      { code: "asc" },
    ],
    select: {
      code: true,
      name: true,
      type: true,
      subtype: true,
      currency: true,
      isActive: true,
      description: true,
    },
  });

  console.table(accounts);

  console.log(`\nTotal accounts: ${accounts.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
