import { prisma } from "./app/lib/prisma";

async function main() {
  const rows = await prisma.vendorOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      orderId: true,
      vendorProfileId: true,
      status: true,
      merchandiseSubtotal: true,
      shipping: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
      createdAt: true,
    },
  });

  console.dir(rows, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
