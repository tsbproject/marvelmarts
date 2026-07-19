import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

export const walletRepository = {
  findWallet(userId: string) {
    return prisma.wallet.findUnique({
      where: {
        userId,
      },
    });
  },

  findBalance(userId: string) {
    return prisma.wallet.findUnique({
      where: {
        userId,
      },
      select: {
        balance: true,
      },
    });
  },

  findTransactions(userId: string) {
    return prisma.walletTransaction.findMany({
      where: {
        wallet: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findTransaction(reference: string) {
    return prisma.walletTransaction.findUnique({
      where: {
        reference,
      },
    });
  },


  async findWalletTx(
  tx: Prisma.TransactionClient,
  userId: string
) {
  return tx.wallet.findUnique({
    where: {
      userId,
    },
  });
},

async credit(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number
) {
  return tx.wallet.upsert({
    where: {
      userId,
    },
    update: {
      balance: {
        increment: amount,
      },
    },
    create: {
      userId,
      balance: amount,
    },
  });
},

async debit(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number
) {
  return tx.wallet.update({
    where: {
      userId,
    },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });
},

async createTransaction(
  tx: Prisma.TransactionClient,
  data: {
    walletId: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    reference: string;
    description: string;
  }
) {
  return tx.walletTransaction.create({
    data,
  });
},

async updateOrderPayment(
  orderId: string
) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "PAID",
      paymentTypes: "WALLET",
    },
  });
},
};



