import prisma from "../app/lib/prisma";

async function main() {
  console.log("\n=== F4.4 Vendor Balance Audit ===\n");

  const vendors = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      userId: true,
      balance: true,
      isSuspended: true,
      score: {
        select: {
          tier: true,
          commissionRate: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Vendor profiles found: ${vendors.length}\n`);

  for (const vendor of vendors) {
    console.log(
      `${vendor.id} | ` +
      `user=${vendor.userId} | ` +
      `balance=${vendor.balance.toString()} | ` +
      `tier=${vendor.score?.tier ?? "NONE"} | ` +
      `commission=${vendor.score?.commissionRate ?? "NONE"}`
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
