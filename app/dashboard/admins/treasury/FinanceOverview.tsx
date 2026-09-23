"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Receipt,
  Wallet,
} from "lucide-react";

import { formatNaira } from "@/app/lib/FormatNaira";

type FinancialAccount = {
  code: string;
  name: string;
  type: string;
  subtype: string | null;
  currency: string;
  debit: number;
  credit: number;
  balance: number;
};

type FinanceOverviewResponse = {
  success: boolean;
  overview: {
    accounts: FinancialAccount[];
    totalRevenue: number;
    totalExpenses: number;
    postedTransactionCount: number;
  };
};

const ACCOUNT_CODES = {
  PAYSTACK_CLEARING: "1010",
  ORDER_CLEARING: "1100",
  VENDOR_PAYABLE: "2000",
  MARKETPLACE_COMMISSION: "4000",
  SHIPPING_REVENUE: "4010",
  PROCESSING_FEES: "5000",
} as const;

function getAccount(
  accounts: FinancialAccount[],
  code: string
) {
  return accounts.find((account) => account.code === code);
}

export default function FinanceOverview() {
  const [data, setData] =
    useState<FinanceOverviewResponse["overview"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/admins/finance/overview",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as FinanceOverviewResponse & {
            error?: string;
          };

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Unable to load financial overview."
          );
        }

        if (!cancelled) {
          setData(result.overview);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load financial overview."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const accounts = data?.accounts ?? [];

  const paystackClearing = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.PAYSTACK_CLEARING
      ),
    [accounts]
  );

  const orderClearing = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.ORDER_CLEARING
      ),
    [accounts]
  );

  const vendorPayable = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.VENDOR_PAYABLE
      ),
    [accounts]
  );

  const marketplaceCommission = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.MARKETPLACE_COMMISSION
      ),
    [accounts]
  );

  const shippingRevenue = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.SHIPPING_REVENUE
      ),
    [accounts]
  );

  const processingFees = useMemo(
    () =>
      getAccount(
        accounts,
        ACCOUNT_CODES.PROCESSING_FEES
      ),
    [accounts]
  );

  if (loading) {
    return (
      <section className="mb-10">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-10">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 text-red-600"
              size={20}
            />

            <div>
              <p className="text-sm font-black uppercase tracking-wide text-red-700">
                Financial overview unavailable
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 space-y-6">
      {/* Test environment notice */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-orange-600"
            size={20}
          />

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              Test Mode — Paystack Sandbox
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-orange-700/80">
              Financial figures shown here are sandbox
              test transactions and do not represent
              production financial data.
            </p>
          </div>
        </div>
      </div>

      {/* Financial overview */}
      <div>
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            Financial Overview
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#002B5B]">
            Treasury Position
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FinancialCard
            label="Paystack Clearing"
            value={paystackClearing?.balance ?? 0}
            description="Processor clearing balance"
            icon={<CreditCard size={20} />}
            tone="blue"
          />

          <FinancialCard
            label="Order Clearing"
            value={orderClearing?.balance ?? 0}
            description="Order settlement control"
            icon={<Receipt size={20} />}
            tone="slate"
          />

          <FinancialCard
            label="Vendor Payable"
            value={vendorPayable?.balance ?? 0}
            description="Amount owed to vendors"
            icon={<Wallet size={20} />}
            tone="amber"
          />

          <FinancialCard
            label="Posted Transactions"
            value={data?.postedTransactionCount ?? 0}
            description="Posted financial transactions"
            icon={<Landmark size={20} />}
            tone="emerald"
            isCurrency={false}
          />
        </div>
      </div>

      {/* Revenue and expenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinancialBreakdown
          title="Revenue"
          total={data?.totalRevenue ?? 0}
          icon={<ArrowUpRight size={20} />}
          items={[
            {
              label: "Marketplace Commission",
              value:
                marketplaceCommission?.balance ?? 0,
            },
            {
              label: "Shipping Revenue",
              value: shippingRevenue?.balance ?? 0,
            },
          ]}
        />

        <FinancialBreakdown
          title="Expenses"
          total={data?.totalExpenses ?? 0}
          icon={<ArrowDownRight size={20} />}
          items={[
            {
              label: "Processing Fees",
              value: processingFees?.balance ?? 0,
            },
          ]}
        />
      </div>
    </section>
  );
}

function FinancialCard({
  label,
  value,
  description,
  icon,
  tone,
  isCurrency = true,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  tone: "blue" | "slate" | "amber" | "emerald";
  isCurrency?: boolean;
}) {
  const toneStyles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-[#002B5B]",
    },
    slate: {
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-800",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },
  };

  const styles = toneStyles[tone];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-black tracking-tight ${styles.value}`}
          >
            {isCurrency ? formatNaira(value) : value}
          </p>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FinancialBreakdown({
  title,
  total,
  icon,
  items,
}: {
  title: string;
  total: number;
  icon: React.ReactNode;
  items: {
    label: string;
    value: number;
  }[];
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002B5B]/5 text-[#002B5B]">
            {icon}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
              {title}
            </p>

            <p className="mt-1 text-xl font-black text-[#002B5B]">
              {formatNaira(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm font-semibold text-gray-600">
              {item.label}
            </span>

            <span className="text-sm font-black text-gray-900">
              {formatNaira(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}