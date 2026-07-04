// import { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";


import {
  Prisma,
  TransactionType,
  TransactionStatus,
} from "@prisma/client";



export class WalletService {
  // ==========================================================
  // Queries
  // ==========================================================

  static async getWallet(userId: string) {
    return prisma.wallet.findUnique({
      where: {
        userId,
      },
    });
  }

  static async getBalance(userId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
      select: {
        balance: true,
      },
    });

    return Number(wallet?.balance ?? 0);
  }

  static async getTransactions(userId: string) {
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
  }

  static async getTransaction(reference: string) {
    return prisma.walletTransaction.findUnique({
      where: {
        reference,
      },
    });
  }

  // ==========================================================
  // Credits
  // ==========================================================

  /**
   * Generic wallet credit.
   */
    static async credit(
    userId: string,
    amount: number,
    type: TransactionType,
    reference: string,
    description: string
    ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
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

      await this.createTransaction(
        tx,
        wallet.id,
        amount,
        type,
        "SUCCESS",
        reference,
        description
      );

      return wallet;
    });
  }

  
  // ==========================================================
  // Debits
  // ==========================================================

  /**
   * Generic wallet debit.
   */
    static async debit(
    userId: string,
    amount: number,
    type: TransactionType,
    reference: string,
    description: string
    ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(
        tx,
        userId
      );

      this.ensureSufficientBalance(
        wallet.balance,
        amount
      );

      const updatedWallet =
        await tx.wallet.update({
          where: {
            userId,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

      await this.createTransaction(
        tx,
        wallet.id,
        amount,
        type,
        "SUCCESS",
        reference,
        description
      );

      return updatedWallet;
    });
  }

  /**
   * Wallet payment for order.
   */
  static async debitForOrder(
    userId: string,
    orderId: string,
    totalAmount: number
  ) {
    const reference = `ORD-${orderId}-${Date.now()}`;

    const wallet = await this.debit(
      userId,
      totalAmount,
      "PURCHASE",
      reference,
      `Payment for Order #${orderId}`
    );

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "PAID",
        paymentTypes: "WALLET",
      },
    });

    return {
      success: true as const,
      newBalance: Number(wallet.balance),
    };
  }

  // ==========================================================
  // Private Helpers
  // ==========================================================

  private static async ensureWallet(
    tx: Prisma.TransactionClient,
    userId: string
  ) {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw badRequest("Wallet not found.");
    }

    return wallet;
  }

  private static ensureSufficientBalance(
    balance: Prisma.Decimal | number,
    amount: number
  ) {
    if (Number(balance) < amount) {
      throw badRequest(
        "Insufficient wallet balance."
      );
    }
  }

  private static async createTransaction(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
    type: TransactionType,
    status: TransactionStatus,
    reference: string,
    description: string
  ) {
    return tx.walletTransaction.create({
      data: {
        walletId,
        amount,
        type,
        status,
        reference,
        description,
      },
    });
  }

        /**
         * Credit wallet after payment has already been verified.
         */
       static async creditVerifiedPayment(
  userId: string,
  amount: number,
  reference: string,
  description: string
) {
  const existing =
    await prisma.walletTransaction.findUnique({
      where: {
        reference,
      },
    });

  if (existing) {
    return {
      success: true,
      alreadyProcessed: true,
      balance: await this.getBalance(userId),
    };
  }

  const wallet = await this.credit(
    userId,
    amount,
    TransactionType.TOPUP,
    reference,
    description
  );

  return {
    success: true,
    alreadyProcessed: false,
    balance: Number(wallet.balance),
  };
}}








