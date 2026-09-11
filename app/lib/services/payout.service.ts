import { prisma } from "@/app/lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  conflict
} from "@/app/lib/auth/errors";



import { TransactionStatus } from "@prisma/client";
import { AuditService } from "@/app/lib/services/logging/audit.service";

export class PayoutService {
  static async getVendorPayouts(
    vendorId: string
  ) {
    return prisma.payout.findMany({
      where: {
        vendorId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async createPayoutRequest(
      profile: {
        id: string;
        bankName: string;
        accountName: string;
        accountNumber: string;
      },
      userId: string,
      amount: number
    ) {
      const result = await prisma.$transaction(async (tx) => {
        /*
        * Re-confirm ownership inside the service boundary.
        *
        * The route already resolves the profile from the authenticated
        * session, but this prevents future callers from accidentally
        * creating a payout against another vendor's profile.
        */
        const vendorProfile =
          await tx.vendorProfile.findFirst({
            where: {
              id: profile.id,
              userId,
            },
            select: {
              id: true,
              balance: true,
              isSuspended: true,
            },
          });

        if (!vendorProfile) {
          throw forbidden(
            "You do not have permission to request a payout from this vendor profile."
          );
        }

        if (vendorProfile.isSuspended) {
          throw forbidden(
            "Your vendor account is suspended."
          );
        }

        /*
        * The balance must be checked inside the same transaction
        * that performs the deduction.
        */
        if (
          Number(vendorProfile.balance) <
          amount
        ) {
          throw badRequest(
            "Insufficient balance."
          );
        }

        /*
        * Create the payout only after ownership and balance
        * have been verified.
        */
        const payout =
          await tx.payout.create({
            data: {
              amount,
              status: "PENDING",
              vendorId: userId,
              vendorProfileId: vendorProfile.id,
              bankName: profile.bankName,
              accountNumber: profile.accountNumber,
              accountName: profile.accountName,
              reference: `PAYOUT-${Date.now()}-${Math.floor(
                Math.random() * 100000
              )}`,
            },
          });

        /*
        * Deduct from the exact profile that belongs to the
        * authenticated user.
        */
        const updatedProfile =
          await tx.vendorProfile.update({
            where: {
              id: vendorProfile.id,
            },
            data: {
              balance: {
                decrement: amount,
              },
            },
          });

                return {
                  payout,
                  newBalance:
                    Number(updatedProfile.balance),
                };
              });

              await AuditService.payoutRequested({
                actorId: userId,
                entityId: result.payout.id,
                newValues: {
                  status: result.payout.status,
                  amount: Number(result.payout.amount),
                  vendorId: result.payout.vendorId,
                  vendorProfileId: result.payout.vendorProfileId,
                },
              });

              return result;
            }
        static async validatePayoutRequest(
            userId: string,
            amount: number
            ) {
            const profile =
                await prisma.vendorProfile.findUnique({
                where: {
                    userId,
                },
                });

            if (!profile) {
                throw notFound(
                "Vendor profile not found."
                );
            }

            if (
                !profile.bankName ||
                !profile.accountNumber ||
                !profile.accountName
            ) {
                throw badRequest(
                "Complete your payout details before requesting a payout."
                );
            }

            if (profile.isSuspended) {
                throw forbidden(
                "Your vendor account is suspended."
                );
            }

            if (Number(profile.balance) < amount) {
                throw badRequest(
                "Insufficient balance."
                );
            }

            return profile;
            }


  static async getAdminPayouts() {
    const payouts =
        await prisma.payout.findMany({
        include: {
            vendor: {
            select: {
                name: true,
            },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        });

    return payouts.map((payout) => ({
        id: payout.id,

        vendorProfileId:
        payout.vendorProfileId,

        vendorName:
        payout.vendor?.name ??
        "Unknown Vendor",

        amount: Number(
        payout.amount
        ),

        status: payout.status,

        accountName:
        payout.accountName,

        accountNumber:
        payout.accountNumber,

        bankName:
        payout.bankName,

        createdAt:
        payout.createdAt.toISOString(),
    }));
    }


   static async processPayout(
    payoutId: string,
    status: "APPROVED" | "REJECTED",
    remarks: string,
    adminId: string
  ) {
    if (!payoutId || !status) {
        throw badRequest(
        "Payout ID and status are required."
        );
    }

    if (
        status !== "APPROVED" &&
        status !== "REJECTED"
    ) {
        throw badRequest(
        "Invalid payout status."
        );
    }

    const payout =
        await prisma.payout.findUnique({
        where: {
            id: payoutId,
        },
        include: {
            vendor: {
            select: {
                id: true,
                name: true,
                email: true,
            },
            },
        },
        });

    if (!payout) {
        throw notFound(
        "Payout request not found."
        );
    }

    if (payout.status !== "PENDING") {
        throw conflict(
        `Payout has already been processed as ${payout.status}.`
        );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedPayout =
            await tx.payout.update({
            where: {
                id: payoutId,
            },
            data: {
                status,
                adminRemarks:
                remarks ||
                (status ===
                "APPROVED"
                    ? "Processed by Administrator"
                    : "Rejected by Administrator"),
                processedAt:
                new Date(),
            },
            include: {
                vendor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                },
            },
            });

        let newBalance:
            | number
            | null = null;

        if (
            status === "REJECTED"
        ) {
            const profile =
            await tx.vendorProfile.update({
                where: {
                id: payout.vendorProfileId,
                },
                data: {
                balance: {
                    increment:
                    payout.amount,
                },
                },
            });

            newBalance = Number(
            profile.balance
            );
        }

               return {
            updatedPayout,
            newBalance,
            vendorId:
            payout.vendorId,
        };
        }
    );

    const auditData = {
      actorId: adminId,
      entityId: result.updatedPayout.id,
      oldValues: {
        status: payout.status,
        adminRemarks: payout.adminRemarks,
      },
      newValues: {
        status: result.updatedPayout.status,
        adminRemarks: result.updatedPayout.adminRemarks,
      },
    };

    if (status === "APPROVED") {
      await AuditService.payoutApproved(auditData);
    } else {
      await AuditService.payoutRejected(auditData);
    }

    return result;
    }


  static async requestWithdrawal(
      userId: string,
      amount: number
    ) {
      if (!amount || amount <= 0) {
        throw badRequest(
          "Invalid withdrawal amount."
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const vendor =
          await tx.vendorProfile.findUnique({
            where: {
              userId,
            },
            select: {
              id: true,
              balance: true,
              isSuspended: true,
            },
          });

        if (!vendor) {
          throw notFound(
            "Vendor profile not found."
          );
        }

        if (vendor.isSuspended) {
          throw forbidden(
            "Account suspended. Withdrawals are locked."
          );
        }

        /*
        * Atomically reserve the requested amount.
        *
        * The balance condition is included in the UPDATE itself,
        * so a concurrent withdrawal cannot spend the same balance
        * after this check.
        */
        const updated =
          await tx.vendorProfile.updateMany({
            where: {
              id: vendor.id,
              balance: {
                gte: amount,
              },
            },
            data: {
              balance: {
                decrement: amount,
              },
            },
          });

        if (updated.count !== 1) {
          throw badRequest(
            "Insufficient balance."
          );
        }

        const withdrawal =
          await tx.withdrawal.create({
            data: {
              vendorProfileId: vendor.id,
              amount,
              status: "PENDING",
            },
          });

                return withdrawal;
      });

      await AuditService.withdrawalRequested({
        actorId: userId,
        entityId: result.id,
        newValues: {
          status: result.status,
          amount: Number(result.amount),
          vendorProfileId: result.vendorProfileId,
        },
      });

      return result;

      }


 static async calculateVendorPayout(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        vendorProfile: {
          include: {
            score: true,
          },
        },
      },
    });

    if (!order || !order.vendorProfile?.score) {
      throw new Error("Order or Vendor Score configuration not found");
    }

    const totalAmount = Number(order.total);
    const commissionRate = order.vendorProfile.score.commissionRate;

    const platformFee = totalAmount * commissionRate;
    const vendorNetPayout = totalAmount - platformFee;

    return {
      totalAmount,
      platformFee,
      vendorNetPayout,
      commissionRate,
      tier: order.vendorProfile.score.tier,
      vendorProfileId: order.vendorProfileId,
    };
  }

    static async finalizeVendorPayout(orderId: string) {
    const payout = await this.calculateVendorPayout(orderId);

    const transaction =
      await prisma.$transaction(async (tx) => {
        const marketplaceTransaction =
          await tx.marketplaceTransaction.create({
            data: {
              orderId,
              vendorProfileId: payout.vendorProfileId,
              grossAmount: payout.totalAmount,
              platformFee: payout.platformFee,
              netAmount: payout.vendorNetPayout,
              commissionRate: payout.commissionRate,
              vendorTier: payout.tier,
              status: TransactionStatus.SUCCESS,
              reference: `TRX-${orderId}-${Date.now()}`,
            },
          });

        await tx.vendorProfile.update({
          where: {
            id: payout.vendorProfileId,
          },
          data: {
            balance: {
              increment: payout.vendorNetPayout,
            },
          },
        });

        return marketplaceTransaction;
      });

    await AuditService.payoutFinalized({
      entityId: transaction.id,
      newValues: {
        actorType: "SYSTEM",
        orderId,
        marketplaceTransactionId: transaction.id,
        vendorProfileId: payout.vendorProfileId,
        grossAmount: payout.totalAmount,
        platformFee: payout.platformFee,
        vendorNetPayout: payout.vendorNetPayout,
        commissionRate: payout.commissionRate,
        vendorTier: payout.tier,
        status: TransactionStatus.SUCCESS,
        reference: transaction.reference,
      },
    });

    return {
      success: true,
      totalAmount: payout.totalAmount,
      platformFee: payout.platformFee,
      vendorNetPayout: payout.vendorNetPayout,
    };
  }
}