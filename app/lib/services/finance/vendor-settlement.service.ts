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
}

export default VendorSettlementService;