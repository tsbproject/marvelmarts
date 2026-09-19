import {
  FinancialAccountSubtype,
  FinancialAccountType,
  FinancialTransactionStatus,
  Prisma,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";

const ACCOUNT_CODES = {
  PAYSTACK_CLEARING: "1010",
  VENDOR_PAYABLE: "2000",
  PENDING_PAYOUTS: "2020",
  MARKETPLACE_COMMISSION_REVENUE: "4000",
  SHIPPING_REVENUE: "4010",
  PROCESSING_FEES: "5000",
  CUSTOMER_REFUND_PAYABLE: "2010",
} as const;

type Decimal = Prisma.Decimal;

type FinancialMetric = {
  amount: Decimal;
  currency: string;
};

type DashboardPeriod = {
  from: Date;
  to: Date;
};

function zero(): Decimal {
  return new Prisma.Decimal(0);
}

function add(...values: Decimal[]): Decimal {
  return values.reduce(
    (total, value) => total.plus(value),
    zero()
  );
}

function subtract(left: Decimal, right: Decimal): Decimal {
  return left.minus(right);
}

function toMetric(
  amount: Decimal,
  currency = "NGN"
): FinancialMetric {
  return {
    amount,
    currency,
  };
}

function formatMetric(metric: FinancialMetric) {
  return {
    amount: metric.amount.toFixed(2),
    currency: metric.currency,
  };
}

async function getAccountBalance(
  accountCode: string,
  period?: DashboardPeriod
): Promise<FinancialMetric> {
  const account = await prisma.financialAccount.findUnique({
    where: {
      code: accountCode,
    },
    select: {
      id: true,
      currency: true,
    },
  });

  if (!account) {
    throw new Error(
      `Financial account "${accountCode}" does not exist.`
    );
  }

  const entries = await prisma.financialLedgerEntry.aggregate({
    where: {
      accountId: account.id,
      transaction: {
        status: FinancialTransactionStatus.POSTED,
        ...(period
          ? {
              occurredAt: {
                gte: period.from,
                lt: period.to,
              },
            }
          : {}),
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const debit = entries._sum.debit ?? zero();
  const credit = entries._sum.credit ?? zero();

  const balance =
  accountCode === ACCOUNT_CODES.PAYSTACK_CLEARING
    ? subtract(debit, credit)
    : subtract(credit, debit);

    return toMetric(balance, account.currency);
}

async function getRevenue(
  accountCode: string,
  period?: DashboardPeriod
): Promise<FinancialMetric> {
  const account = await prisma.financialAccount.findUnique({
    where: {
      code: accountCode,
    },
    select: {
      id: true,
      currency: true,
    },
  });

  if (!account) {
    throw new Error(
      `Financial account "${accountCode}" does not exist.`
    );
  }

  const entries = await prisma.financialLedgerEntry.aggregate({
    where: {
      accountId: account.id,
      transaction: {
        status: FinancialTransactionStatus.POSTED,
        ...(period
          ? {
              occurredAt: {
                gte: period.from,
                lt: period.to,
              },
            }
          : {}),
      },
    },
    _sum: {
      credit: true,
      debit: true,
    },
  });

  const credit = entries._sum.credit ?? zero();
  const debit = entries._sum.debit ?? zero();

  return toMetric(
    subtract(credit, debit),
    account.currency
  );
}

async function getExpense(
  accountCode: string,
  period?: DashboardPeriod
): Promise<FinancialMetric> {
  const account = await prisma.financialAccount.findUnique({
    where: {
      code: accountCode,
    },
    select: {
      id: true,
      currency: true,
    },
  });

  if (!account) {
    throw new Error(
      `Financial account "${accountCode}" does not exist.`
    );
  }

  const entries = await prisma.financialLedgerEntry.aggregate({
    where: {
      accountId: account.id,
      transaction: {
        status: FinancialTransactionStatus.POSTED,
        ...(period
          ? {
              occurredAt: {
                gte: period.from,
                lt: period.to,
              },
            }
          : {}),
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const debit = entries._sum.debit ?? zero();
  const credit = entries._sum.credit ?? zero();

  return toMetric(
    subtract(debit, credit),
    account.currency
  );
}

function getTodayPeriod(now: Date): DashboardPeriod {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return {
    from,
    to,
  };
}

function getCurrentMonthPeriod(now: Date): DashboardPeriod {
  const from = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const to = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  return {
    from,
    to,
  };
}

async function getSales(
  period?: DashboardPeriod
): Promise<FinancialMetric> {
  const result =
    await prisma.financialTransaction.aggregate({
      where: {
        type: "SALE",
        status: FinancialTransactionStatus.POSTED,
        reference: {
          startsWith: "SALE-PAYMENT-",
        },
        ...(period
          ? {
              occurredAt: {
                gte: period.from,
                lt: period.to,
              },
            }
          : {}),
      },
      _sum: {
        amount: true,
      },
    });

  return toMetric(result._sum.amount ?? zero());
}

export class FinanceService {
  static async getDashboardSummary(now = new Date()) {
    const today = getTodayPeriod(now);
    const currentMonth = getCurrentMonthPeriod(now);

    const [
      lifetimeSales,
      lifetimeCommission,
      lifetimeShipping,
      lifetimeVendorPayable,
      lifetimePaystackClearing,
      lifetimeProcessingFees,
      lifetimeRefundPayable,
      lifetimePendingPayouts,
      todaySales,
      todayCommission,
      todayShipping,
      todayProcessingFees,
      monthSales,
      monthCommission,
      monthShipping,
      monthProcessingFees,
    ] = await Promise.all([
      getSales(),
      getRevenue(
        ACCOUNT_CODES.MARKETPLACE_COMMISSION_REVENUE
      ),
      getRevenue(
        ACCOUNT_CODES.SHIPPING_REVENUE
      ),
      getAccountBalance(
        ACCOUNT_CODES.VENDOR_PAYABLE
      ),
      getAccountBalance(
        ACCOUNT_CODES.PAYSTACK_CLEARING
      ),
      getExpense(
        ACCOUNT_CODES.PROCESSING_FEES
      ),
      getAccountBalance(
        ACCOUNT_CODES.CUSTOMER_REFUND_PAYABLE
      ),
      getAccountBalance(
        ACCOUNT_CODES.PENDING_PAYOUTS
      ),

      getSales(today),
      getRevenue(
        ACCOUNT_CODES.MARKETPLACE_COMMISSION_REVENUE,
        today
      ),
      getRevenue(
        ACCOUNT_CODES.SHIPPING_REVENUE,
        today
      ),
      getExpense(
        ACCOUNT_CODES.PROCESSING_FEES,
        today
      ),

      getSales(currentMonth),
      getRevenue(
        ACCOUNT_CODES.MARKETPLACE_COMMISSION_REVENUE,
        currentMonth
      ),
      getRevenue(
        ACCOUNT_CODES.SHIPPING_REVENUE,
        currentMonth
      ),
      getExpense(
        ACCOUNT_CODES.PROCESSING_FEES,
        currentMonth
      ),
    ]);

    const lifetimeGrossRevenue = add(
      lifetimeCommission.amount,
      lifetimeShipping.amount
    );

    const todayGrossRevenue = add(
      todayCommission.amount,
      todayShipping.amount
    );

    const monthGrossRevenue = add(
      monthCommission.amount,
      monthShipping.amount
    );

    return {
      generatedAt: now.toISOString(),
      currency: "NGN",

      today: {
        sales: formatMetric(todaySales),
        marketplaceCommissionRevenue:
          formatMetric(todayCommission),
        shippingRevenue:
          formatMetric(todayShipping),
        grossMarketplaceRevenue: formatMetric(
          toMetric(todayGrossRevenue)
        ),
        processingFees:
          formatMetric(todayProcessingFees),
      },

      currentMonth: {
        sales: formatMetric(monthSales),
        marketplaceCommissionRevenue:
          formatMetric(monthCommission),
        shippingRevenue:
          formatMetric(monthShipping),
        grossMarketplaceRevenue: formatMetric(
          toMetric(monthGrossRevenue)
        ),
        processingFees:
          formatMetric(monthProcessingFees),
      },

      lifetime: {
        sales: formatMetric(lifetimeSales),
        marketplaceCommissionRevenue:
          formatMetric(lifetimeCommission),
        shippingRevenue:
          formatMetric(lifetimeShipping),
        grossMarketplaceRevenue: formatMetric(
          toMetric(lifetimeGrossRevenue)
        ),
        processingFees:
          formatMetric(lifetimeProcessingFees),

        vendorPayable:
          formatMetric(lifetimeVendorPayable),
        paystackClearing:
          formatMetric(lifetimePaystackClearing),
        customerRefundPayable:
          formatMetric(lifetimeRefundPayable),
        pendingPayouts:
          formatMetric(lifetimePendingPayouts),
      },
    };
  }
}

export default FinanceService;
