import {
  FinancialTransactionStatus,
  FinancialTransactionType,
  Prisma,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";

import {
  FinancialPostingError,
  postFinancialTransaction,
} from "@/app/lib/services/finance/financial-posting.service";

const VENDOR_PAYABLE_ACCOUNT = "2000";
const PAYSTACK_CLEARING_ACCOUNT = "1010";

function decimal(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return new Prisma.Decimal(value ?? 0);
}

export class VendorSettlementService {
  /**
   * Returns the vendor's outstanding payable balance from the
   * financial ledger.
   *
   * Accounting rule:
   *
   * Vendor Payable Credits
   * -
   * Vendor Payable Debits
   * =
   * Outstanding Vendor Payable
   *
   * This method is intentionally read-only.
   */
  static async getVendorPayable(
    vendorProfileId: string
  ) {
    if (!vendorProfileId) {
      throw new FinancialPostingError(
        "Vendor profile ID is required."
      );
    }

    const account =
      await prisma.financialAccount.findUnique({
        where: {
          code: VENDOR_PAYABLE_ACCOUNT,
        },
        select: {
          id: true,
          code: true,
          name: true,
          currency: true,
          isActive: true,
        },
      });

    if (!account) {
      throw new FinancialPostingError(
        `Financial account "${VENDOR_PAYABLE_ACCOUNT}" does not exist.`
      );
    }

    if (!account.isActive) {
      throw new FinancialPostingError(
        `Financial account "${VENDOR_PAYABLE_ACCOUNT}" is inactive.`
      );
    }

    const entries =
      await prisma.financialLedgerEntry.findMany({
        where: {
          accountId: account.id,
          vendorProfileId,
          transaction: {
            status:
              FinancialTransactionStatus.POSTED,
          },
        },
        select: {
          debit: true,
          credit: true,
        },
      });

    const totalCredits = entries.reduce(
      (total, entry) =>
        total.plus(decimal(entry.credit)),
      new Prisma.Decimal(0)
    );

    const totalDebits = entries.reduce(
      (total, entry) =>
        total.plus(decimal(entry.debit)),
      new Prisma.Decimal(0)
    );

    const outstandingPayable =
      totalCredits.minus(totalDebits);

    return {
      vendorProfileId,
      accountCode: account.code,
      accountName: account.name,
      currency: account.currency,
      totalCredits,
      totalDebits,
      outstandingPayable,
    };
  }

  /**
   * Records the financial settlement of an already-approved
   * vendor payout.
   *
   * Accounting:
   *
   * Dr Vendor Payable
   * Cr Paystack Clearing
   *
   * This method does NOT:
   * - create or update a Payout record
   * - mutate VendorProfile.balance
   * - change payout status
   *
   * The existing Payout workflow remains responsible for those
   * operational concerns.
   */
  static async settleVendorPayout(input: {
    payoutId: string;
    vendorProfileId: string;
    amount: Prisma.Decimal | number | string;
    currency?: string;
    actorUserId?: string;
  }) {
    if (!input.payoutId) {
      throw new FinancialPostingError(
        "Payout ID is required."
      );
    }

    if (!input.vendorProfileId) {
      throw new FinancialPostingError(
        "Vendor profile ID is required."
      );
    }


    const settlementReference = `PAYOUT-SETTLEMENT-${input.payoutId}`;

    const existing = await prisma.financialTransaction.findUnique({
    where: {
        reference: settlementReference,
    },
    include: {
        ledgerEntries: true,
    },
    });

    if (existing) {
    return existing;
    }

    const amount = decimal(input.amount);
    const currency = input.currency ?? "NGN";

    if (!amount.gt(0)) {
      throw new FinancialPostingError(
        "Payout settlement amount must be greater than zero."
      );
    }

    const payable =
      await this.getVendorPayable(
        input.vendorProfileId
      );

    if (payable.currency !== currency) {
      throw new FinancialPostingError(
        `Vendor payable uses ${payable.currency}, not ${currency}.`
      );
    }

    if (
      payable.outstandingPayable.lt(amount)
    ) {
      throw new FinancialPostingError(
        `Vendor payout settlement of ${amount.toFixed(
          2
        )} exceeds outstanding vendor payable of ${payable.outstandingPayable.toFixed(
          2
        )}.`
      );
    }

    return postFinancialTransaction({
      reference: settlementReference,
        idempotencyKey: settlementReference,
            type:
                FinancialTransactionType.PAYOUT,
      amount,
      currency,
      description:
        `Vendor payout settlement ${input.payoutId}.`,
      vendorProfileId:
        input.vendorProfileId,
      externalReference:
        input.payoutId,
      actorUserId:
        input.actorUserId,
      entries: [
        {
          accountCode:
            VENDOR_PAYABLE_ACCOUNT,
          debit: amount,
          description:
            `Reduce vendor payable for payout ${input.payoutId}.`,
          vendorProfileId:
            input.vendorProfileId,
        },
        {
          accountCode:
            PAYSTACK_CLEARING_ACCOUNT,
          credit: amount,
          description:
            `Record Paystack clearing settlement for payout ${input.payoutId}.`,
        },
      ],
    });
  }


      /**
   * Returns paginated vendor payable balances for the
   * admin finance report.
   *
   * Accounting rule:
   *
   * Vendor Payable Credits
   * -
   * Vendor Payable Debits
   * =
   * Outstanding Vendor Payable
   *
   * This method is intentionally read-only.
   */
  static async getVendorPayables(input?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?:
      | "payableCreated"
      | "settled"
      | "outstanding"
      | "lastActivity";
    sortOrder?: "asc" | "desc";
  }) {
    const account =
      await prisma.financialAccount.findUnique({
        where: {
          code: VENDOR_PAYABLE_ACCOUNT,
        },
        select: {
          id: true,
          code: true,
          name: true,
          currency: true,
          isActive: true,
        },
      });

    if (!account) {
      throw new FinancialPostingError(
        `Financial account "${VENDOR_PAYABLE_ACCOUNT}" does not exist.`
      );
    }

    if (!account.isActive) {
      throw new FinancialPostingError(
        `Financial account "${VENDOR_PAYABLE_ACCOUNT}" is inactive.`
      );
    }

    const page = Math.max(
      1,
      Math.floor(input?.page ?? 1)
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Math.floor(input?.limit ?? 25)
      )
    );

    const search =
      input?.search?.trim().toLowerCase() ?? "";

    const sortBy =
      input?.sortBy ?? "outstanding";

    const sortOrder =
      input?.sortOrder ?? "desc";

    const groupedEntries =
      await prisma.financialLedgerEntry.groupBy({
        by: ["vendorProfileId"],
        where: {
          accountId: account.id,
          vendorProfileId: {
            not: null,
          },
          transaction: {
            status:
              FinancialTransactionStatus.POSTED,
          },
        },
        _sum: {
          debit: true,
          credit: true,
        },
        _max: {
          createdAt: true,
        },
      });

    const vendorProfileIds =
      groupedEntries
        .map(
          (entry) =>
            entry.vendorProfileId
        )
        .filter(
          (
            vendorProfileId
          ): vendorProfileId is string =>
            Boolean(vendorProfileId)
        );

    if (
      vendorProfileIds.length === 0
    ) {
      return {
        accountCode: account.code,
        accountName: account.name,
        currency: account.currency,
        summary: {
          totalPayableCreated: "0.00",
          totalSettled: "0.00",
          totalOutstanding: "0.00",
          vendorCount: 0,
        },
        vendors: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const vendors =
      await prisma.vendorProfile.findMany({
        where: {
          id: {
            in: vendorProfileIds,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          storeName: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

    const vendorMap = new Map(
      vendors.map((vendor) => [
        vendor.id,
        vendor,
      ])
    );

    const balances =
      groupedEntries.map((entry) => {
        const vendorProfileId =
          entry.vendorProfileId as string;

        const vendor =
          vendorMap.get(
            vendorProfileId
          );

        const totalPayableCreated =
          decimal(
            entry._sum.credit
          );

        const totalSettled =
          decimal(
            entry._sum.debit
          );

        const outstandingPayable =
          totalPayableCreated.minus(
            totalSettled
          );

        return {
          vendorProfileId,

          vendor: vendor
            ? {
                id: vendor.id,
                storeName:
                  vendor.storeName,
                firstName:
                  vendor.firstName,
                lastName:
                  vendor.lastName,
                name:
                  vendor.user.name ??
                  `${vendor.firstName} ${vendor.lastName}`.trim(),
                email:
                  vendor.user.email,
              }
            : null,

          totalPayableCreated,
          totalSettled,
          outstandingPayable,

          currency:
            account.currency,

          lastActivityAt:
            entry._max.createdAt,
        };
      });

    const summary =
      balances.reduce(
        (result, vendor) => {
          result.totalPayableCreated =
            result.totalPayableCreated.plus(
              vendor.totalPayableCreated
            );

          result.totalSettled =
            result.totalSettled.plus(
              vendor.totalSettled
            );

          result.totalOutstanding =
            result.totalOutstanding.plus(
              vendor.outstandingPayable
            );

          return result;
        },
        {
          totalPayableCreated:
            new Prisma.Decimal(0),
          totalSettled:
            new Prisma.Decimal(0),
          totalOutstanding:
            new Prisma.Decimal(0),
        }
      );

    const filtered =
      search.length === 0
        ? balances
        : balances.filter(
            (vendor) => {
              const searchable = [
                vendor.vendor?.storeName,
                vendor.vendor?.name,
                vendor.vendor?.firstName,
                vendor.vendor?.lastName,
                vendor.vendor?.email,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return searchable.includes(
                search
              );
            }
          );

    filtered.sort(
      (a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "payableCreated":
            comparison =
              a.totalPayableCreated.comparedTo(
                b.totalPayableCreated
              );
            break;

          case "settled":
            comparison =
              a.totalSettled.comparedTo(
                b.totalSettled
              );
            break;

          case "lastActivity":
            comparison =
              (a.lastActivityAt?.getTime() ?? 0) -
              (b.lastActivityAt?.getTime() ?? 0);
            break;

          case "outstanding":
          default:
            comparison =
              a.outstandingPayable.comparedTo(
                b.outstandingPayable
              );
            break;
        }

        return sortOrder === "asc"
          ? comparison
          : -comparison;
      }
    );

    const total =
      filtered.length;

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / limit
          );

    const safePage =
      totalPages > 0
        ? Math.min(
            page,
            totalPages
          )
        : 1;

    const start =
      (safePage - 1) * limit;

    const paginatedVendors =
      filtered.slice(
        start,
        start + limit
      );

    return {
      accountCode: account.code,
      accountName: account.name,
      currency: account.currency,

      summary: {
        totalPayableCreated:
          summary.totalPayableCreated.toFixed(
            2
          ),
        totalSettled:
          summary.totalSettled.toFixed(
            2
          ),
        totalOutstanding:
          summary.totalOutstanding.toFixed(
            2
          ),
        vendorCount:
          balances.length,
      },

      vendors:
        paginatedVendors.map(
          (vendor) => ({
            ...vendor,
            totalPayableCreated:
              vendor.totalPayableCreated.toFixed(
                2
              ),
            totalSettled:
              vendor.totalSettled.toFixed(
                2
              ),
            outstandingPayable:
              vendor.outstandingPayable.toFixed(
                2
              ),
          })
        ),

      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }
}

export default VendorSettlementService;