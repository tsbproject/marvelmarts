import { prisma } from "@/app/lib/prisma";

function generateOrderNumber() {
  const year = new Date().getFullYear();

  const random = Math.floor(
    100000 +
    Math.random() * 900000
  );

  return `MARVEL-${year}-${random}`;
}

export async function generateUniqueOrderNumber() {
  let orderNumber =
    generateOrderNumber();

  let exists =
    await prisma.order.findUnique({
      where: {
        orderNumber,
      },

      select: {
        id: true,
      },
    });

  while (exists) {
    orderNumber =
      generateOrderNumber();

    exists =
      await prisma.order.findUnique({
        where: {
          orderNumber,
        },

        select: {
          id: true,
        },
      });
  }

  return orderNumber;
}