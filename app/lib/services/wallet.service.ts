import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";
import { walletRepository } from "@/app/lib/repositories/wallet-repository";
import { OrderService } from "@/app/lib/services/order.service";
import { sendVendorCreditPurchaseEmail } from "@/app/lib/mailer";
import { PaymentService } from "@/app/lib/services/payment.service";
import { logger } from "@/app/lib/logger";
import { AuditService } from "./logging/audit.service";


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

        await AuditService.walletFunded({
          actorId: userId,
          entityId: wallet.id,
          newValues: {
            amount,
            type,
            reference,
            description,
            balance: Number(wallet.balance),
          },
        });

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
    const wallet =
      await this.ensureWallet(
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

    await AuditService.walletWithdrawn({
      actorId: userId,
      entityId: wallet.id,
      oldValues: {
        balance: Number(wallet.balance),
      },
      newValues: {
        balance: Number(updatedWallet.balance),
        amount,
        type,
        reference,
        description,
      },
    });

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
 * Credit wallet after a payment has already been
 * verified by the payment provider.
 *
 * The payment reference is the idempotency key.
 * Wallet balance and wallet transaction are written
 * atomically in the same database transaction.
 */
static async creditVerifiedPayment(
  userId: string,
  amount: number,
  reference: string,
  description: string
) {
  if (!userId?.trim()) {
    throw badRequest(
      "User ID is required."
    );
  }

  if (!reference?.trim()) {
    throw badRequest(
      "Payment reference is required."
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw badRequest(
      "Invalid wallet funding amount."
    );
  }

  const normalizedReference =
    reference.trim();

  const normalizedAmount =
    Number(amount.toFixed(2));

  /*
   * First check outside the transaction.
   *
   * This handles the normal repeated-callback case
   * without opening another transaction unnecessarily.
   */
  const existing =
    await walletRepository.findTransaction(
      normalizedReference
    );

  if (existing) {
    const existingWallet =
      await walletRepository.findWallet(
        userId
      );

    if (!existingWallet) {
      throw badRequest(
        "Wallet not found."
      );
    }

    /*
     * Make sure the existing transaction actually
     * belongs to this user's wallet.
     *
     * This prevents a reference belonging to another
     * user's transaction from being treated as
     * successfully processed for the current user.
     */
    if (
      existing.walletId !==
      existingWallet.id
    ) {
      throw badRequest(
        "Payment does not belong to this user."
      );
    }

    return {
      success: true,
      alreadyProcessed: true,
      balance: Number(
        existingWallet.balance
      ),
    };
  }

  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Re-check inside the transaction.
           *
           * This protects against two simultaneous
           * requests reaching this method with the
           * same Paystack reference.
           */
          const transaction =
            await tx.walletTransaction.findUnique(
              {
                where: {
                  reference:
                    normalizedReference,
                },
              }
            );

          if (transaction) {
            const wallet =
              await tx.wallet.findUnique({
                where: {
                  id: transaction.walletId,
                },
              });

            if (!wallet) {
              throw new Error(
                "Wallet associated with payment transaction was not found."
              );
            }

            if (
              wallet.userId !== userId
            ) {
              throw badRequest(
                "Payment does not belong to this user."
              );
            }

            return {
              wallet,
              alreadyProcessed: true,
            };
          }

          
          /*
    * Get or create the wallet for a verified
    * funding operation.
          *
      * A successful payment must be able to fund
      * a customer even if their Wallet row has
      * not been created yet.
      */
      const wallet =
        await tx.wallet.upsert({
          where: {
            userId,
          },
          update: {},
          create: {
            userId,
            balance: 0,
          },
        });

        /*
        * Credit the wallet and create the
        * corresponding transaction inside the
        * SAME database transaction.
        */
        const updatedWallet =
          await tx.wallet.update({
              where: {
                id: wallet.id,
              },
              data: {
                balance: {
                  increment:
                    normalizedAmount,
                },
              },
            });

          await tx.walletTransaction.create({
            data: {
              walletId:
                updatedWallet.id,
              amount:
                normalizedAmount,
              type:
                TransactionType.TOPUP,
              status:
                TransactionStatus.SUCCESS,
              reference:
                normalizedReference,
              description,
            },
          });

          await AuditService.walletFunded({
            actorId: userId,
            entityId:
              updatedWallet.id,
            oldValues: {
              balance: Number(
                wallet.balance
              ),
            },
            newValues: {
              balance: Number(
                updatedWallet.balance
              ),
              amount:
                normalizedAmount,
              type:
                TransactionType.TOPUP,
              reference:
                normalizedReference,
              description,
            },
          });

          return {
            wallet:
              updatedWallet,
            alreadyProcessed: false,
          };
        }
      );

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
        },
      });

    /*
     * Email is deliberately outside the database
     * transaction. A mail failure must never roll
     * back a successfully completed wallet payment.
     */
    if (
      user?.email &&
      !result.alreadyProcessed
    ) {
      try {
        await sendVendorCreditPurchaseEmail({
          email: user.email,
          firstName:
            user.name ?? "Vendor",
          storeName:
            "MarvelMarts Store",
          amountAdded:
            normalizedAmount,
          newBalance:
            Number(
              result.wallet.balance
            ),
        });
      } catch (error) {
        logger.error(
          "WALLET_FUNDING_EMAIL_ERROR:",
          error
        );
      }
    }

    return {
      success: true,
      alreadyProcessed:
        result.alreadyProcessed,
      balance: Number(
        result.wallet.balance
      ),
    };
  } catch (error) {
    /*
     * WalletTransaction.reference is @unique.
     *
     * If two requests race and the second one loses
     * the unique-reference insert, retrieve the
     * already-created transaction and return the
     * current wallet balance rather than crediting
     * the wallet again.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing =
        await walletRepository.findTransaction(
          normalizedReference
        );

      if (existing) {
        const wallet =
          await walletRepository.findWallet(
            userId
          );

        if (!wallet) {
          throw badRequest(
            "Wallet not found."
          );
        }

        if (
          existing.walletId !==
          wallet.id
        ) {
          throw badRequest(
            "Payment does not belong to this user."
          );
        }

        return {
          success: true,
          alreadyProcessed: true,
          balance: Number(
            wallet.balance
          ),
        };
      }
    }

    throw error;
  }
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

  if (
    typeof metadata.userId !== "string" ||
    !metadata.userId
  ) {
    throw badRequest(
      "Wallet funding user is missing."
    );
  }

  const wallet =
    await this.creditVerifiedPayment(
      metadata.userId,
      Number(transaction.amount) / 100,
      transaction.reference,
      "Wallet funding"
    );

  /*
   * Saving the card is optional.
   *
   * A card-storage failure must never turn a
   * successfully completed wallet funding into
   * a failed payment.
   */
  if (metadata.saveCard === true) {
    try {
      await PaymentService.savePaymentMethod(
        metadata.userId,
        transaction.reference
      );
    } catch (error) {
      logger.error(
        "WALLET_CARD_SAVE_FAILED:",
        error
      );
    }
  }

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
      logger.error(
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








