import { prisma } from "@/app/lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  conflict
} from "@/app/lib/auth/errors";

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
        return prisma.$transaction(async (tx) => {
            const payout = await tx.payout.create({
            data: {
                amount,
                status: "PENDING",
                vendorId: userId,
                vendorProfileId: profile.id,
                bankName: profile.bankName,
                accountNumber: profile.accountNumber,
                accountName: profile.accountName,
                reference: `PAYOUT-${Date.now()}-${Math.floor(
                Math.random() * 100000
                )}`,
            },
            });

            const updatedProfile =
            await tx.vendorProfile.update({
                where: {
                id: profile.id,
                },
                data: {
                balance: {
                    decrement: amount,
                },
                },
            });

            return {
            payout,
            newBalance: Number(updatedProfile.balance),
            };
        });
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
    remarks: string
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

    return prisma.$transaction(
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

  const vendor =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
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

  if (amount > Number(vendor.balance)) {
    throw badRequest(
      "Insufficient balance."
    );
  }

  const [withdrawal] =
    await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          vendorProfileId: vendor.id,
          amount,
          status: "PENDING",
        },
      }),

      prisma.vendorProfile.update({
        where: {
          id: vendor.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
    ]);

  return withdrawal;
}
}