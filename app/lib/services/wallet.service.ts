import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";
import { walletRepository } from "@/app/lib/repositories/wallet-repository";
import { OrderService } from "@/app/lib/services/order.service";
import { sendVendorCreditPurchaseEmail } from "@/app/lib/mailer";
import { PaymentService } from "@/app/lib/services/payment.service";


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
  return walletRepository.findWallet(userId);
}

static async getBalance(
  userId: string
): Promise<number> {
  const wallet =
    await walletRepository.findBalance(
      userId
    );

  return Number(
    wallet?.balance ?? 0
  );
}

static async getTransactions(
  userId: string
) {
  return walletRepository.findTransactions(
    userId
  );
}

static async getTransaction(
  reference: string
) {
  return walletRepository.findTransaction(
    reference
  );
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
  try {
    return await prisma.$transaction(
      async (tx) => {
        const wallet =
          await walletRepository.credit(
            tx,
            userId,
            amount
          );

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
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return await this.getWallet(userId);
    }

    throw error;
  }
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
        await walletRepository.debit(
          tx,
          userId,
          amount
        );

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

    await walletRepository.updateOrderPayment(
        orderId
      );

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
    const wallet =
      await walletRepository.findWalletTx(
        tx,
        userId
      );

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
    return walletRepository.createTransaction(
        tx,
        {
          walletId,
          amount,
          type,
          status,
          reference,
          description,
        }
      );
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
    await walletRepository.findTransaction(reference);

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

  if (!wallet) {
  throw new Error(
    "Wallet could not be retrieved after funding."
  );
}

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (user?.email) {
    await sendVendorCreditPurchaseEmail({
      email: user.email,
      firstName: user.name ?? "Vendor",
      storeName: "MarvelMarts Store",
      amountAdded: amount,
      newBalance: Number(wallet.balance),
    });
  }

  return {
    success: true,
    alreadyProcessed: false,
    balance: Number(wallet.balance),
  };
}

static async checkout(
  userId: string,
  body: {
    amount: number;
    items: any[];
    shippingAddress: any;
  }
) {
  const {
    amount,
    items,
    shippingAddress,
  } = body;

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw badRequest(
      "No checkout items provided."
    );
  }

  const vendorProfileId =
    items[0]?.vendorProfileId;

  if (!vendorProfileId) {
    throw badRequest(
      "Vendor profile is required."
    );
  }

  const mixedVendors =
    items.some(
      (item) =>
        item.vendorProfileId &&
        item.vendorProfileId !==
          vendorProfileId
    );

  if (mixedVendors) {
    throw badRequest(
      "Wallet checkout currently supports one vendor per order."
    );
  }

  const total = Number(amount);

  if (
    !Number.isFinite(total) ||
    total <= 0
  ) {
    throw badRequest(
      "Invalid payment amount."
    );
  }

  const result = await prisma.$transaction(
    async (
      tx: Prisma.TransactionClient
    ) => {
      const wallet =
        await this.ensureWallet(
          tx,
          userId
        );

      this.ensureSufficientBalance(
        wallet.balance,
        total
      );

      await walletRepository.debit(
        tx,
        userId,
        total
      );

      await this.createTransaction(
        tx,
        wallet.id,
        total,
        TransactionType.PURCHASE,
        TransactionStatus.SUCCESS,
        `ORD-${Date.now()}`,
        "Wallet checkout"
      );

      const normalizedItems =
        items.map((item) => ({
          productId:
            item.productId,
          variantId:
            item.variantId,
          quantity:
            Number(item.quantity) || 1,
        }));

      const orderItems =
        items.map((item) => ({
          productId:
            item.productId ?? null,
          variantId:
            item.variantId ?? null,
          qty:
            Number(item.quantity) || 1,
          unitPrice:
            new Prisma.Decimal(
              Number(item.price) || 0
            ),
          imageUrl:
            item.imageUrl ?? null,
          title:
            item.title ?? null,
        }));

      const order =
        await OrderService.createOrderTx(
          tx,
          {
            orderNumber: `MM-${Date.now()}`,
            userId,
            vendorProfileId,
            formData: shippingAddress,
            orderItems,
            normalizedItems,
            subtotal: total,
            shipping: 0,
            total,
          }
        );

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentTypes: "WALLET",
        },
      });

      return {
        success: true,
        orderId: order.id,
      };
    }
  );

  await OrderService.completePaidOrder(
    result.orderId,
    `WALLET-${Date.now()}`
  );

  return result;
}


static async completeWalletFunding(
  transaction: any
) {
  const metadata = transaction.metadata ?? {};

  if (metadata.type !== "wallet") {
    throw badRequest("Invalid payment type.");
  }

  const wallet =
    await this.creditVerifiedPayment(
      metadata.userId,
      Number(transaction.amount) / 100,
      transaction.reference,
      "Wallet funding"
    );

  return {
    success: true,
    wallet,
    returnUrl:
      typeof metadata.returnUrl === "string"
        ? metadata.returnUrl
        : "/account/customer/payment-methods",
  };
}


static async verifyWalletFunding({
  userId,
  reference,
}: {
  userId: string;
  reference: string;
}) {
  const transaction =
    await PaymentService.verifyTransaction(reference);

  const metadata = transaction.metadata ?? {};

  if (metadata.type !== "wallet") {
    throw badRequest("Invalid payment type.");
  }

  if (metadata.userId !== userId) {
    throw badRequest(
      "Payment does not belong to this user."
    );
  }

  const wallet =
    await WalletService.creditVerifiedPayment(
      userId,
      Number(transaction.amount) / 100,
      reference,
      "Wallet funding"
    );

  if (metadata.saveCard) {
    try {
      await PaymentService.savePaymentMethod(
        userId,
        reference
      );
    } catch (error) {
      console.error(
        "Card save failed:",
        error
      );
    }
  }

  return {
    wallet,
    returnUrl:
      typeof metadata.returnUrl === "string"
        ? metadata.returnUrl
        : "/account/customer/payment-methods",
  };
}

}








