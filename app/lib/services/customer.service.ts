import { prisma } from "@/app/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                              CUSTOMER SERVICE                              */
/* -------------------------------------------------------------------------- */

export class CustomerService {

  /* -------------------------------------------------------------------------- */
  /*                        CUSTOMER DASHBOARD SECTION                           */
  /* -------------------------------------------------------------------------- */

  static async getDashboardData(userId: string) {
    const [orders, wishlistItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.wishlist.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    return {
      orders,
      wishlistCount: wishlistItems.length,
    };
  }


  /* -------------------------------------------------------------------------- */
/*                    CUSTOMER PAYMENT METHODS SECTION                         */
/* -------------------------------------------------------------------------- */

static async getPaymentMethodsData(
  userId: string
) {
  const [cards, wallet] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: "desc",
      },
    }),

    prisma.wallet.findUnique({
      where: {
        userId,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    }),
  ]);

  return {
    cards,
    wallet,
  };
}
}