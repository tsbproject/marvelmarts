import {
  FinancialTransactionStatus,
  FinancialTransactionType,
  Prisma,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";

export type FinancialPostingEntry = {
  accountCode: string;
  debit?: Prisma.Decimal | number | string;
  credit?: Prisma.Decimal | number | string;
  description?: string;
  vendorProfileId?: string;
  userId?: string;
  orderId?: string;
};

export type PostFinancialTransactionInput = {
  reference: string;
  type: FinancialTransactionType;
  amount: Prisma.Decimal | number | string;
  currency?: string;
  description?: string;

  orderId?: string;
  vendorProfileId?: string;
  userId?: string;

  externalReference?: string;
  idempotencyKey?: string;

  metadata?: Prisma.InputJsonValue;
  occurredAt?: Date;

  entries: FinancialPostingEntry[];

  actorUserId?: string;
};

export class FinancialPostingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinancialPostingError";
  }
}

function toDecimal(
  value: Prisma.Decimal | number | string | undefined
): Prisma.Decimal {
  if (value === undefined) {
    return new Prisma.Decimal(0);
  }

  return new Prisma.Decimal(value);
}

function isPositive(value: Prisma.Decimal): boolean {
  return value.gt(0);
}

export async function postFinancialTransaction(
  input: PostFinancialTransactionInput
) {
  const currency = input.currency ?? "NGN";
  const amount = toDecimal(input.amount);

  if (!isPositive(amount)) {
    throw new FinancialPostingError(
      "Financial transaction amount must be greater than zero."
    );
  }

  if (!input.reference.trim()) {
    throw new FinancialPostingError(
      "Financial transaction reference is required."
    );
  }

  if (input.entries.length < 2) {
    throw new FinancialPostingError(
      "A financial transaction requires at least two ledger entries."
    );
  }

  const normalizedEntries = input.entries.map((entry, index) => {
    const debit = toDecimal(entry.debit);
    const credit = toDecimal(entry.credit);

    if (debit.gt(0) && credit.gt(0)) {
      throw new FinancialPostingError(
        `Ledger entry ${index + 1} cannot contain both debit and credit.`
      );
    }

    if (!debit.gt(0) && !credit.gt(0)) {
      throw new FinancialPostingError(
        `Ledger entry ${index + 1} must contain either a debit or credit amount.`
      );
    }

    if (debit.lt(0) || credit.lt(0)) {
      throw new FinancialPostingError(
        `Ledger entry ${index + 1} cannot contain negative amounts.`
      );
    }

    return {
      ...entry,
      debit,
      credit,
    };
  });

  const totalDebit = normalizedEntries.reduce(
    (total, entry) => total.plus(entry.debit),
    new Prisma.Decimal(0)
  );

  const totalCredit = normalizedEntries.reduce(
    (total, entry) => total.plus(entry.credit),
    new Prisma.Decimal(0)
  );

  if (!totalDebit.eq(totalCredit)) {
    throw new FinancialPostingError(
      `Financial transaction is unbalanced. Debit=${totalDebit.toFixed(
        2
      )}, Credit=${totalCredit.toFixed(2)}.`
    );
  }

  if (!totalDebit.eq(amount)) {
    throw new FinancialPostingError(
      `Transaction amount does not match ledger total. Amount=${amount.toFixed(
        2
      )}, Ledger=${totalDebit.toFixed(2)}.`
    );
  }

    return prisma.$transaction(
    async (tx) => {
      const existing = await tx.financialTransaction.findFirst({
        where: {
          OR: [
            { reference: input.reference },
            ...(input.idempotencyKey
              ? [{ idempotencyKey: input.idempotencyKey }]
              : []),
            ...(input.externalReference
              ? [{ externalReference: input.externalReference }]
              : []),
          ],
        },
        include: {
          ledgerEntries: true,
        },
      });

      if (existing) {
        return existing;
      }

      const accountCodes = [
        ...new Set(normalizedEntries.map((entry) => entry.accountCode)),
      ];

      const accounts = await tx.financialAccount.findMany({
        where: {
          code: {
            in: accountCodes,
          },
        },
        select: {
          id: true,
          code: true,
          currency: true,
          isActive: true,
        },
      });

      const accountMap = new Map(
        accounts.map((account) => [account.code, account])
      );

      for (const code of accountCodes) {
        const account = accountMap.get(code);

        if (!account) {
          throw new FinancialPostingError(
            `Financial account "${code}" does not exist.`
          );
        }

        if (!account.isActive) {
          throw new FinancialPostingError(
            `Financial account "${code}" is inactive.`
          );
        }

        if (account.currency !== currency) {
          throw new FinancialPostingError(
            `Financial account "${code}" uses ${account.currency}, not ${currency}.`
          );
        }
      }

      const transaction = await tx.financialTransaction.create({
        data: {
          reference: input.reference,
          type: input.type,
          status: FinancialTransactionStatus.POSTED,
          amount,
          currency,
          description: input.description,
          orderId: input.orderId,
          vendorProfileId: input.vendorProfileId,
          userId: input.userId,
          externalReference: input.externalReference,
          idempotencyKey: input.idempotencyKey,
          metadata: input.metadata,
          occurredAt: input.occurredAt ?? new Date(),
        },
      });

      await tx.financialLedgerEntry.createMany({
        data: normalizedEntries.map((entry) => ({
          transactionId: transaction.id,
          accountId: accountMap.get(entry.accountCode)!.id,
          debit: entry.debit,
          credit: entry.credit,
          currency,
          description: entry.description,
          vendorProfileId:
            entry.vendorProfileId ?? input.vendorProfileId,
          userId: entry.userId ?? input.userId,
          orderId: entry.orderId ?? input.orderId,
        })),
      });

      await tx.financialAuditLog.create({
        data: {
          transactionId: transaction.id,
          actorUserId: input.actorUserId,
          action: "POSTED",
          afterData: {
            reference: transaction.reference,
            type: transaction.type,
            status: transaction.status,
            amount: amount.toFixed(2),
            currency,
            ledgerEntryCount: normalizedEntries.length,
          },
        },
      });

      return tx.financialTransaction.findUniqueOrThrow({
        where: {
          id: transaction.id,
        },
        include: {
          ledgerEntries: {
            include: {
              account: true,
            },
          },
        },
      });
    },
    {
      timeout: 15000,
    }
  );
}


export default postFinancialTransaction;
