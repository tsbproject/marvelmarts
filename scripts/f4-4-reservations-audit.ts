import prisma from "../app/lib/prisma";

async function main() {
  console.log("\n=== F4.4 Payout / Withdrawal Reservation Audit ===\n");

  const payouts = await prisma.payout.findMany({
    where: {
      status: "PENDING",
    },
    select: {
      id: true,
      vendorProfileId: true,
      vendorId: true,
      amount: true,
      status: true,
      reference: true,
      createdAt: true,
    },
    orderBy: {
      vendorProfileId: "asc",
    },
  });

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      status: "PENDING",
    },
    select: {
      id: true,
      vendorProfileId: true,
      amount: true,
      status: true,
      reference: true,
      createdAt: true,
    },
    orderBy: {
      vendorProfileId: "asc",
    },
  });

  console.log(`Pending payouts: ${payouts.length}`);

  for (const payout of payouts) {
    console.log(
      `PAYOUT | ${payout.id} | ` +
      `vendor=${payout.vendorProfileId} | ` +
      `amount=${payout.amount} | ` +
      `status=${payout.status} | ` +
      `reference=${payout.reference}`
    );
  }

  console.log(`\nPending withdrawals: ${withdrawals.length}`);

  for (const withdrawal of withdrawals) {
    console.log(
      `WITHDRAWAL | ${withdrawal.id} | ` +
      `vendor=${withdrawal.vendorProfileId} | ` +
      `amount=${withdrawal.amount} | ` +
      `status=${withdrawal.status} | ` +
      `reference=${withdrawal.reference}`
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
