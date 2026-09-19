import prisma from "../app/lib/prisma";

async function main() {
  console.log("\n=== F4.4 Complete Payout History ===\n");

  const payouts = await prisma.payout.findMany({
    select: {
      id: true,
      vendorProfileId: true,
      vendorId: true,
      amount: true,
      status: true,
      reference: true,
      adminRemarks: true,
      processedAt: true,
      createdAt: true,
    },
    orderBy: [
      { vendorProfileId: "asc" },
      { createdAt: "asc" },
    ],
  });

  console.log(`Payout records found: ${payouts.length}\n`);

  for (const payout of payouts) {
    console.log(
      `${payout.id} | ` +
      `vendor=${payout.vendorProfileId} | ` +
      `amount=${payout.amount} | ` +
      `status=${payout.status} | ` +
      `reference=${payout.reference} | ` +
      `created=${payout.createdAt.toISOString()} | ` +
      `processed=${payout.processedAt?.toISOString() ?? "NONE"}`
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
