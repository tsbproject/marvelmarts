import prisma from "../app/lib/prisma";

async function main() {
  console.log("\n=== F4.4 MarketplaceTransaction Audit ===\n");

  const transactions =
    await prisma.marketplaceTransaction.findMany({
      select: {
        id: true,
        orderId: true,
        vendorProfileId: true,
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        commissionRate: true,
        vendorTier: true,
        status: true,
        reference: true,
      },
      orderBy: {
        vendorProfileId: "asc",
      },
    });

  console.log(`Marketplace transactions found: ${transactions.length}\n`);

  for (const tx of transactions) {
    console.log(
      `${tx.id} | ` +
      `order=${tx.orderId} | ` +
      `vendor=${tx.vendorProfileId} | ` +
      `gross=${tx.grossAmount} | ` +
      `fee=${tx.platformFee} | ` +
      `net=${tx.netAmount} | ` +
      `rate=${tx.commissionRate} | ` +
      `tier=${tx.vendorTier} | ` +
      `status=${tx.status} | ` +
      `reference=${tx.reference}`
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
