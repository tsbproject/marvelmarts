
import {
  Prisma,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import {
  sendVendorCreditPurchaseEmail,
  sendVendorExhaustedCreditsEmail,
  sendVendorLowCreditsEmail,
} from "@/app/lib/mailer";

type BoostProductResult = {
  success: true;
  newBalance: number;
  expiry: Date;
};

type TransactionHistoryResult =
  | {
      success: true;
      transactions: {
        id: string;
        createdAt: string;
        status: string;
        amount: number;
        reference: string;
        vendorProfileId: string;
        platform: string;
      }[];
    }
  | {
      success: false;
      error: string;
    };

export class BoostService {
  /**
   * --------------------------------------------------------
   * PRIVATE HELPERS
   * --------------------------------------------------------
   */

  private static getBoostPlanDetails(days: number) {
    switch (days) {
      case 3:
        return {
          cost: 15,
          duration: 3,
        };

      case 7:
        return {
          cost: 30,
          duration: 7,
        };

      case 30:
        return {
          cost: 100,
          duration: 30,
        };

      default:
        return {
          cost: days * 5,
          duration: days,
        };
    }
  }

  /**
   * --------------------------------------------------------
   * BOOST PRODUCT
   * --------------------------------------------------------
   */

  static async boostProduct(
    userId: string,
    productId: string,
    requestedDays: number,
    actor: {
      id: string;
      email: string | null;
      role: UserRole;
    }
  ): Promise<BoostProductResult> {
    const { cost, duration } =
      this.getBoostPlanDetails(requestedDays);

    const result = await prisma.$transaction(async (tx) => {
      const vendorProfile =
        await tx.vendorProfile.findUnique({
          where: {
            userId,
          },
          select: {
            id: true,
          },
        });

      if (!vendorProfile) {
        throw new Error("Vendor profile not found.");
      }

      const vendorBoost =
        await tx.vendorBoost.findUnique({
          where: {
            vendorProfileId: vendorProfile.id,
          },
          select: {
            id: true,
            credits: true,
            lowCreditAlertSent: true,
            exhaustedAlertSent: true,
          },
        });

      if (!vendorBoost) {
        throw new Error("Vendor boost account not found.");
      }

      if (vendorBoost.credits < cost) {
        throw new Error(
          `Insufficient credits. You need ${cost} credits for this plan.`
        );
      }

      const product =
        await tx.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            title: true,
            boostUntil: true,
            vendorProfileId: true,
          },
        });

      if (!product) {
        throw new Error("Product not found.");
      }

      if (
        product.vendorProfileId !==
        vendorProfile.id
      ) {
        throw new Error(
          "Unauthorized: Ownership mismatch."
        );
      }

      const now = new Date();

      const baseDate =
        product.boostUntil &&
        new Date(product.boostUntil) > now
          ? new Date(product.boostUntil)
          : now;

      const newBoostUntil = new Date(baseDate);

      newBoostUntil.setDate(
        newBoostUntil.getDate() + duration
      );

      const previousBalance =
        vendorBoost.credits;

      const updatedBoost =
        await tx.vendorBoost.update({
          where: {
            id: vendorBoost.id,
          },
          data: {
            credits: {
              decrement: cost,
            },
          },
          select: {
            credits: true,
            lowCreditAlertSent: true,
            exhaustedAlertSent: true,
          },
        });

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          boostUntil: newBoostUntil,
          isTrending: true,
        },
      });

      await tx.creditTransaction.create({
        data: {
          reference: `USE_${productId}_${Date.now()}`,
          amount: -cost,
          vendorProfileId: vendorProfile.id,
          status: "SUCCESS",
          platform: "INTERNAL_BOOST",
        },
      });

            const vendor =
        await tx.vendorProfile.findUnique({
          where: {
            id: vendorProfile.id,
          },
          select: {
            id: true,
            storeName: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        });

      return {
        success: true as const,
        newBalance: updatedBoost.credits,
        expiry: newBoostUntil,
        previousBalance,
        vendorProfileId: vendorProfile.id,
        lowCreditAlertSent:
          updatedBoost.lowCreditAlertSent,
        exhaustedAlertSent:
          updatedBoost.exhaustedAlertSent,
        vendor,
      };
    });

    if (result.vendor?.user?.email) {
      const crossedLowThreshold =
        result.previousBalance > 10 &&
        result.newBalance <= 10 &&
        result.newBalance > 0;

      const becameExhausted =
        result.previousBalance > 0 &&
        result.newBalance === 0;

      if (
        becameExhausted &&
        !result.exhaustedAlertSent
      ) {
        await sendVendorExhaustedCreditsEmail({
          email: result.vendor.user.email,
          firstName:
            result.vendor.user.name ??
            "Vendor",
          storeName:
            result.vendor.storeName ??
            result.vendor.user.name ??
            "Your Store",
        });

        await prisma.vendorBoost.update({
          where: {
            vendorProfileId:
              result.vendorProfileId,
          },
          data: {
            exhaustedAlertSent: true,
            lowCreditAlertSent: true,
          },
        });
      } else if (
        crossedLowThreshold &&
        !result.lowCreditAlertSent
      ) {
        await sendVendorLowCreditsEmail({
          email: result.vendor.user.email,
          firstName:
            result.vendor.user.name ??
            "Vendor",
          storeName:
            result.vendor.storeName ??
            result.vendor.user.name ??
            "Your Store",
          currentBalance:
            result.newBalance,
        });

        await prisma.vendorBoost.update({
          where: {
            vendorProfileId:
              result.vendorProfileId,
          },
          data: {
            lowCreditAlertSent: true,
          },
        });
      }
    }

    return {
      success: true,
      newBalance: result.newBalance,
      expiry: result.expiry,
    };
  }

  /**
   * --------------------------------------------------------
   * ADD CREDITS
   * --------------------------------------------------------
   */

  static async addCreditsToVendor(
    vendorProfileId: string,
    amount: number,
    reference: string
  ): Promise<
    | {
        success: true;
        newBalance: number;
      }
    | {
        success: false;
        error: string;
      }
  > {
    const existingTransaction =
      await prisma.creditTransaction.findUnique({
        where: {
          reference,
        },
      });

    if (existingTransaction) {
      throw new Error(
        "Transaction already processed."
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        await tx.creditTransaction.create({
          data: {
            reference,
            amount,
            vendorProfileId,
            status: "SUCCESS",
           platform: "PAYSTACK",
            emailSent: false,
          },
        });

        const updatedBoost =
          await tx.vendorBoost.update({
            where: {
              vendorProfileId,
            },
            data: {
              credits: {
                increment: amount,
              },
              lowCreditAlertSent: false,
              exhaustedAlertSent: false,
            },
          });

        const vendor =
          await tx.vendorProfile.findUnique({
            where: {
              id: vendorProfileId,
            },
            select: {
              storeName: true,
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          });

        return {
          updatedBoost,
          vendor,
        };
      }
    );

            if (result.vendor?.user?.email) {
          await sendVendorCreditPurchaseEmail({
            email: result.vendor.user.email,
            firstName:
              result.vendor.user.name ??
              "Vendor",
            storeName:
              result.vendor.storeName ??
              result.vendor.user.name ??
              "Your Store",
            amountAdded: amount,
            newBalance:
              result.updatedBoost.credits,
          });

          await prisma.creditTransaction.update({
            where: {
              reference,
            },
            data: {
              emailSent: true,
              emailSentAt: new Date(),
            },
          });
        }

        return {
          success: true,
          newBalance:
            result.updatedBoost.credits,
        };
      } catch (error: unknown) {
        return {
            success: false,
            error:
            error instanceof Error
                ? error.message
                : "An unexpected error occurred.",
        };
        }


      /**
     * --------------------------------------------------------
     * TRANSACTION HISTORY
     * --------------------------------------------------------
     */

    static async getTransactionHistory(
      vendorProfileId: string
    ): Promise<TransactionHistoryResult> {
      try {
        const transactions =
          await prisma.creditTransaction.findMany({
            where: {
              vendorProfileId,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          });

        return {
          success: true,
          transactions: JSON.parse(
            JSON.stringify(transactions)
          ),
        };
      } catch (error) {
        console.error(
          "[BoostService.getTransactionHistory]",
          error
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load transactions.",
        };
      }
    }

    static async cleanupExpiredBoosts() {
        const now = new Date();

        const result = await prisma.product.updateMany({
            where: {
            boostUntil: {
                lt: now,
            },
            isTrending: true,
            },
            data: {
            isTrending: false,
            },
        });

        return {
            success: true,
            count: result.count,
            message: `Cleaned up ${result.count} expired boosts.`,
        };
        }
    
    }

    
