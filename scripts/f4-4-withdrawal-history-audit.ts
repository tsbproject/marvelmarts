import prisma from "../app/lib/prisma";

async function main() {
  console.log("\n=== F4.4 Complete Withdrawal History ===\n");

  const withdrawals = await prisma.withdrawal.findMany({
    select: {
      id: true,
      vendorProfileId: true,
      amount: true,
      status: true,
      reference: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { vendorProfileId: "asc" },
      { createdAt: "asc" },
    ],
  });

  console.log(`Withdrawal records found: ${withdrawals.length}\n`);

  for (const withdrawal of withdrawals) {
    console.log(
      `${withdrawal.id} | ` +
      `vendor=${withdrawal.vendorProfileId} | ` +
      `amount=${withdrawal.amount} | ` +
      `status=${withdrawal.status} | ` +
      `reference=${withdrawal.reference} | ` +
      `created=${withdrawal.createdAt.toISOString()} | ` +
      `updated=${withdrawal.updatedAt.toISOString()}`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
