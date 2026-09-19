import { prisma } from "./app/lib/prisma";

async function main() {
  const rows = await prisma.vendorScore.findMany({
    select: {
      vendorProfileId: true,
      commissionRate: true,
      tier: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  console.dir(rows, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
