import "dotenv/config";
import { prisma } from "./app/lib/prisma";

const vendorOrders = await prisma.vendorOrder.findMany({
  where: {
    vendorProfileId: "cmn803wni000a8svjstuwe25s",
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 10,
  select: {
    id: true,
    orderId: true,
    vendorProfileId: true,
    merchandiseSubtotal: true,
    total: true,
    status: true,
    createdAt: true,

    order: {
      select: {
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        items: {
          select: {
            id: true,
            productId: true,
            title: true,
            qty: true,
            unitPrice: true,
          },
        },
      },
    },

    items: {
      select: {
        id: true,
        orderItemId: true,
        orderItem: {
          select: {
            productId: true,
            title: true,
            qty: true,
            unitPrice: true,
          },
        },
      },
    },
  },
});

console.dir(vendorOrders, { depth: null });

await prisma.$disconnect();
