import prisma from "@/app/lib/prisma";
import {
  FinancialAccountType,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from "@prisma/client";

const ACCOUNT_CODES = {
  PAYSTACK_CLEARING: "1010",
  ORDER_CLEARING: "1100",
  VENDOR_PAYABLE: "2000",
  MARKETPLACE_COMMISSION: "4000",
  SHIPPING_REVENUE: "4010",
  PROCESSING_FEES: "5000",
} as const;

export class FinancialReportingService {
  
  static async getOverview() {
    const accounts = await prisma.financialAccount.findMany({
      where: {
        code: {
          in: Object.values(ACCOUNT_CODES),
        },
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        subtype: true,
        currency: true,
      },
    });

    const accountIds = accounts.map((account) => account.id);

    const ledgerTotals = await prisma.financialLedgerEntry.groupBy({
      by: ["accountId"],
      where: {
        accountId: {
          in: accountIds,
        },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const totalsByAccount = new Map(
      ledgerTotals.map((entry) => [
        entry.accountId,
        {
          debit: entry._sum.debit ?? 0,
          credit: entry._sum.credit ?? 0,
        },
      ]),
    );

    const accountBalances = accounts.map((account) => {
      const totals = totalsByAccount.get(account.id);

      const debit = Number(totals?.debit ?? 0);
      const credit = Number(totals?.credit ?? 0);

      const balance =
        account.type === FinancialAccountType.ASSET ||
        account.type === FinancialAccountType.EXPENSE
          ? debit - credit
          : credit - debit;

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        currency: account.currency,
        debit,
        credit,
        balance,
      };
    });
    const revenueAccounts = await prisma.financialAccount.findMany({
      where: {
        type: FinancialAccountType.REVENUE,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        currency: true,
      },
    });

    const expenseAccounts = await prisma.financialAccount.findMany({
      where: {
        type: FinancialAccountType.EXPENSE,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        currency: true,
      },
    });

    const revenueAccountIds = revenueAccounts.map((account) => account.id);
    const expenseAccountIds = expenseAccounts.map((account) => account.id);

    const [revenueTotals, expenseTotals, postedTransactionCount] =
      await Promise.all([
        prisma.financialLedgerEntry.aggregate({
          where: {
            accountId: {
              in: revenueAccountIds,
            },
          },
          _sum: {
            credit: true,
          },
        }),

        prisma.financialLedgerEntry.aggregate({
          where: {
            accountId: {
              in: expenseAccountIds,
            },
          },
          _sum: {
            debit: true,
          },
        }),

        prisma.financialTransaction.count({
          where: {
            status: FinancialTransactionStatus.POSTED,
          },
        }),
      ]);

    return {
      accounts: accountBalances,
      totalRevenue: Number(revenueTotals._sum.credit ?? 0),
      totalExpenses: Number(expenseTotals._sum.debit ?? 0),
      postedTransactionCount,
    };
  }



  static async getPeriodReconciliation(
  startDate: Date,
  endDate: Date,
) {
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error("Invalid reconciliation date range.");
  }

  if (startDate >= endDate) {
    throw new Error(
      "Reconciliation start date must be before end date.",
    );
  }

  const [
    customerPayments,
    saleAllocations,
    postedTransactionCount,
    commissionAccount,
    shippingAccount,
    processingFeeAccount,
    vendorPayableAccount,
  ] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: {
        status: FinancialTransactionStatus.POSTED,
        reference: {
          startsWith: "SALE-PAYMENT-",
        },
        occurredAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.financialTransaction.aggregate({
      where: {
        status: FinancialTransactionStatus.POSTED,
        reference: {
          startsWith: "SALE-ALLOCATION-",
        },
        occurredAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.financialTransaction.count({
      where: {
        status: FinancialTransactionStatus.POSTED,
        occurredAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),

    prisma.financialAccount.findUnique({
      where: {
        code: ACCOUNT_CODES.MARKETPLACE_COMMISSION,
      },
      select: {
        id: true,
      },
    }),

    prisma.financialAccount.findUnique({
      where: {
        code: ACCOUNT_CODES.SHIPPING_REVENUE,
      },
      select: {
        id: true,
      },
    }),

    prisma.financialAccount.findUnique({
      where: {
        code: ACCOUNT_CODES.PROCESSING_FEES,
      },
      select: {
        id: true,
      },
    }),

    prisma.financialAccount.findUnique({
      where: {
        code: ACCOUNT_CODES.VENDOR_PAYABLE,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (
    !commissionAccount ||
    !shippingAccount ||
    !processingFeeAccount ||
    !vendorPayableAccount
  ) {
    throw new Error(
      "Required financial accounts are missing from the chart of accounts.",
    );
  }

  const ledgerTotals =
    await prisma.financialLedgerEntry.groupBy({
      by: ["accountId"],
      where: {
        accountId: {
          in: [
            commissionAccount.id,
            shippingAccount.id,
            processingFeeAccount.id,
            vendorPayableAccount.id,
          ],
        },
        transaction: {
          status: FinancialTransactionStatus.POSTED,
          occurredAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

  const totalsByAccount = new Map(
    ledgerTotals.map((entry) => [
      entry.accountId,
      {
        debit: Number(entry._sum.debit ?? 0),
        credit: Number(entry._sum.credit ?? 0),
      },
    ]),
  );

  const commissionTotals = totalsByAccount.get(
    commissionAccount.id,
  );

  const shippingTotals = totalsByAccount.get(
    shippingAccount.id,
  );

  const processingFeeTotals = totalsByAccount.get(
    processingFeeAccount.id,
  );

  const vendorPayableTotals = totalsByAccount.get(
    vendorPayableAccount.id,
  );

  const grossSales = Number(
    customerPayments._sum.amount ?? 0,
  );

  const saleAllocationTotal = Number(
    saleAllocations._sum.amount ?? 0,
  );

  const marketplaceCommission = Number(
    commissionTotals?.credit ?? 0,
  );

  const shippingRevenue = Number(
    shippingTotals?.credit ?? 0,
  );

  const totalRevenue =
    marketplaceCommission + shippingRevenue;

  const processingFees = Number(
    processingFeeTotals?.debit ?? 0,
  );

  const totalExpenses = processingFees;

  const vendorPayable = Number(
    vendorPayableTotals?.credit ?? 0,
  );

  const orderCount =
    await prisma.financialTransaction.count({
      where: {
        status: FinancialTransactionStatus.POSTED,
        reference: {
          startsWith: "SALE-PAYMENT-",
        },
        orderId: {
          not: null,
        },
        occurredAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

  return {
    period: {
      startDate,
      endDate,
    },

    grossSales,
    customerPayments: grossSales,
    saleAllocations: saleAllocationTotal,

    marketplaceCommission,
    shippingRevenue,
    totalRevenue,

    processingFees,
    totalExpenses,

    netRevenue: totalRevenue - totalExpenses,

    vendorPayable,

    postedTransactionCount,
    orderCount,
  };
}


  static async getRecentTransactions(limit = 10) {
  const transactions =
    await prisma.financialTransaction.findMany({
      where: { status: FinancialTransactionStatus.POSTED },
      orderBy: [
        { occurredAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        reference: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        description: true,
        orderId: true,
        vendorProfileId: true,
        userId: true,
        externalReference: true,
        occurredAt: true,
        createdAt: true,
      },
    });

  const orderIds = transactions
    .map((transaction) => transaction.orderId)
    .filter((id): id is string => Boolean(id));

  const orders =
    orderIds.length > 0
      ? await prisma.order.findMany({
          where: {
            id: {
              in: orderIds,
            },
          },
          select: {
            id: true,
            orderNumber: true,
          },
        })
      : [];

  const orderNumberById = new Map(
    orders.map((order) => [
      order.id,
      order.orderNumber,
    ])
  );

  return transactions.map((transaction) => ({
    id: transaction.id,
    reference: transaction.reference,
    type: transaction.type,
    status: transaction.status,
    amount: Number(transaction.amount),
    currency: transaction.currency,
    description: transaction.description,
    orderId: transaction.orderId,
    orderNumber: transaction.orderId
      ? orderNumberById.get(transaction.orderId) ?? null
      : null,
    vendorProfileId: transaction.vendorProfileId,
    userId: transaction.userId,
    externalReference: transaction.externalReference,
    occurredAt: transaction.occurredAt,
    createdAt: transaction.createdAt,
  }));
}

  static async getGeneralLedger(params?: {
  startDate?: Date;
  endDate?: Date;
  accountCode?: string;
  transactionType?: FinancialTransactionType;
  limit?: number;
}) {
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const accountCode = params?.accountCode?.trim() || undefined;
  const transactionType = params?.transactionType;

  const limit = Math.min(
    Math.max(params?.limit ?? 200, 1),
    500,
  );

  if (startDate && Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid general ledger start date.");
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid general ledger end date.");
  }

  if (startDate && endDate && startDate >= endDate) {
    throw new Error(
      "General ledger start date must be before end date.",
    );
  }

  const account = accountCode
    ? await prisma.financialAccount.findUnique({
        where: {
          code: accountCode,
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          subtype: true,
          currency: true,
        },
      })
    : null;

  if (accountCode && !account) {
    throw new Error(
      `Financial account "${accountCode}" was not found.`,
    );
  }

  const entryWhere = {
    accountId: account?.id,
    transaction: {
      status: FinancialTransactionStatus.POSTED,
      ...(transactionType
        ? {
            type: transactionType,
          }
        : {}),
      ...(startDate || endDate
        ? {
            occurredAt: {
              ...(startDate
                ? {
                    gte: startDate,
                  }
                : {}),
              ...(endDate
                ? {
                    lt: endDate,
                  }
                : {}),
            },
          }
        : {}),
    },
  };

  const [entries, accounts] = await Promise.all([
    prisma.financialLedgerEntry.findMany({
      where: entryWhere,
      orderBy: [
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ],
      take: limit,
      select: {
        id: true,
        transactionId: true,
        accountId: true,
        debit: true,
        credit: true,
        currency: true,
        description: true,
        vendorProfileId: true,
        userId: true,
        orderId: true,
        createdAt: true,

        account: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            subtype: true,
            currency: true,
          },
        },

        transaction: {
          select: {
            id: true,
            reference: true,
            type: true,
            status: true,
            amount: true,
            currency: true,
            description: true,
            orderId: true,
            vendorProfileId: true,
            userId: true,
            externalReference: true,
            occurredAt: true,
            createdAt: true,
          },
        },
      },
    }),

    account
      ? Promise.resolve([account])
      : prisma.financialAccount.findMany({
          where: {
            isActive: true,
          },
          orderBy: {
            code: "asc",
          },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            subtype: true,
            currency: true,
          },
        }),
  ]);

  const accountIds = accounts.map((item) => item.id);

  const openingEntries =
    startDate && accountIds.length > 0
      ? await prisma.financialLedgerEntry.findMany({
          where: {
            accountId: {
              in: accountIds,
            },
            transaction: {
              status: FinancialTransactionStatus.POSTED,
              occurredAt: {
                lt: startDate,
              },
            },
          },
          select: {
            accountId: true,
            debit: true,
            credit: true,
            account: {
              select: {
                type: true,
              },
            },
          },
        })
      : [];

  const openingBalances = new Map<string, number>();

  for (const entry of openingEntries) {
    const debit = Number(entry.debit);
    const credit = Number(entry.credit);

    const movement =
      entry.account.type === FinancialAccountType.ASSET ||
      entry.account.type === FinancialAccountType.EXPENSE
        ? debit - credit
        : credit - debit;

    openingBalances.set(
      entry.accountId,
      (openingBalances.get(entry.accountId) ?? 0) +
        movement,
    );
  }

  const runningBalances = new Map(openingBalances);

  const ledgerEntries = entries.map((entry) => {
    const debit = Number(entry.debit);
    const credit = Number(entry.credit);

    const movement =
      entry.account.type === FinancialAccountType.ASSET ||
      entry.account.type === FinancialAccountType.EXPENSE
        ? debit - credit
        : credit - debit;

    const runningBalance =
      (runningBalances.get(entry.accountId) ?? 0) +
      movement;

    runningBalances.set(entry.accountId, runningBalance);

    return {
      id: entry.id,
      transactionId: entry.transactionId,
      accountId: entry.accountId,
      accountCode: entry.account.code,
      accountName: entry.account.name,
      accountType: entry.account.type,
      accountSubtype: entry.account.subtype,

      debit,
      credit,
      currency: entry.currency,

      description:
        entry.description ??
        entry.transaction.description ??
        null,

      vendorProfileId:
        entry.vendorProfileId ??
        entry.transaction.vendorProfileId ??
        null,

      userId:
        entry.userId ??
        entry.transaction.userId ??
        null,

      orderId:
        entry.orderId ??
        entry.transaction.orderId ??
        null,

      reference: entry.transaction.reference,
      transactionType: entry.transaction.type,
      transactionStatus: entry.transaction.status,
      transactionAmount: Number(entry.transaction.amount),
      externalReference: entry.transaction.externalReference,

      occurredAt: entry.transaction.occurredAt,
      createdAt: entry.createdAt,

      runningBalance,
    };
  });

  const accountSummaries = accounts.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    type: item.type,
    subtype: item.subtype,
    currency: item.currency,
    openingBalance: openingBalances.get(item.id) ?? 0,
    periodDebit: ledgerEntries
      .filter((entry) => entry.accountId === item.id)
      .reduce((sum, entry) => sum + entry.debit, 0),
    periodCredit: ledgerEntries
      .filter((entry) => entry.accountId === item.id)
      .reduce((sum, entry) => sum + entry.credit, 0),
    closingBalance: runningBalances.get(item.id) ?? 0,
  }));

  return {
    startDate: startDate?.toISOString() ?? null,
    endDate: endDate?.toISOString() ?? null,
    accountCode: accountCode ?? null,
    transactionType: transactionType ?? null,
    limit,
    entries: ledgerEntries,
    accounts: accountSummaries,
  };
}
}
