"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Download,
  Printer,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Store,
  Wallet,
} from "lucide-react";

type PeriodPreset = "today" | "yesterday" | "week" | "month" | "custom";

type Reconciliation = {
  period: {
    startDate: string;
    endDate: string;
  };
  grossSales: number;
  customerPayments: number;
  saleAllocations: number;
  marketplaceCommission: number;
  shippingRevenue: number;
  totalRevenue: number;
  processingFees: number;
  totalExpenses: number;
  netRevenue: number;
  vendorPayable: number;
  postedTransactionCount: number;
  orderCount: number;
};

function formatFinancialAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getLagosDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine Lagos business date.");
  }

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

function getLagosDayStartUtc(offsetDays = 0) {
  const { year, month, day } = getLagosDateParts();

  const date = new Date(
    Date.UTC(year, month - 1, day + offsetDays, 0, 0, 0, 0),
  );

  // Lagos is UTC+1 year-round.
  date.setUTCHours(date.getUTCHours() - 1);

  return date;
}

function getPresetRange(preset: Exclude<PeriodPreset, "custom">) {
  switch (preset) {
    case "today":
      return {
        start: getLagosDayStartUtc(0),
        end: getLagosDayStartUtc(1),
      };

    case "yesterday":
      return {
        start: getLagosDayStartUtc(-1),
        end: getLagosDayStartUtc(0),
      };

    case "week": {
      const today = getLagosDayStartUtc(0);

      const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        weekday: "short",
      }).format(today);

      const daysFromMonday =
        weekday === "Mon"
          ? 0
          : weekday === "Tue"
            ? 1
            : weekday === "Wed"
              ? 2
              : weekday === "Thu"
                ? 3
                : weekday === "Fri"
                  ? 4
                  : weekday === "Sat"
                    ? 5
                    : 6;

      return {
        start: getLagosDayStartUtc(-daysFromMonday),
        end: getLagosDayStartUtc(1),
      };
    }

    case "month": {
      const { year, month } = getLagosDateParts();

      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      start.setUTCHours(start.getUTCHours() - 1);

      const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      end.setUTCHours(end.getUTCHours() - 1);

      return { start, end };
    }
  }
}

function toDateInputValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
  }).format(date);
}

function getCustomRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return null;
  }

  // HTML date values represent Lagos calendar dates.
  const [startYear, startMonth, startDay] = startDate
    .split("-")
    .map(Number);

  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  const start = new Date(
    Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0),
  );

  const end = new Date(
    Date.UTC(endYear, endMonth - 1, endDay + 1, 0, 0, 0, 0),
  );

  start.setUTCHours(start.getUTCHours() - 1);
  end.setUTCHours(end.getUTCHours() - 1);

  return { start, end };
}

function formatPeriodLabel(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatter = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const adjustedEnd = new Date(endDate.getTime() - 1);

  return `${formatter.format(startDate)} – ${formatter.format(adjustedEnd)}`;
}


function csvEscape(value: string | number) {
  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function getExportTimestamp() {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

function MetricCard({
  icon,
  label,
  value,
  description,
  emphasis = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        emphasis
          ? "border-[#F7931E]/30 bg-[#FFF8EF]"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-black tracking-tight ${
              emphasis ? "text-[#F7931E]" : "text-[#002B5B]"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-2 ${
            emphasis
              ? "bg-[#F7931E]/10 text-[#F7931E]"
              : "bg-[#002B5B]/5 text-[#002B5B]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function FinancialReconciliation() {
  const [preset, setPreset] = useState<PeriodPreset>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [reconciliation, setReconciliation] =
    useState<Reconciliation | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const customDefaults = useMemo(() => {
    const today = new Date();

    return {
      start: toDateInputValue(today),
      end: toDateInputValue(today),
    };
  }, []);

  useEffect(() => {
    if (!customStart) {
      setCustomStart(customDefaults.start);
    }

    if (!customEnd) {
      setCustomEnd(customDefaults.end);
    }
  }, [customDefaults, customStart, customEnd]);

  const loadReconciliation = useCallback(async () => {
    setError("");

    try {
      let range: { start: Date; end: Date } | null = null;

      if (preset === "custom") {
        range = getCustomRange(customStart, customEnd);

        if (!range) {
          setLoading(false);
          return;
        }
      } else {
        range = getPresetRange(preset);
      }

      if (range.start >= range.end) {
        throw new Error("The selected reconciliation period is invalid.");
      }

      const params = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });

      const response = await fetch(
        `/api/admins/finance/reconciliation?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "Unable to load financial reconciliation.",
        );
      }

      setReconciliation(data.reconciliation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load financial reconciliation.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return;
    }

    void loadReconciliation();
  }, [loadReconciliation, preset, customStart, customEnd]);

  function handleRefresh() {
    setRefreshing(true);
    void loadReconciliation();
  }

  const periodLabel = reconciliation
    ? formatPeriodLabel(
        reconciliation.period.startDate,
        reconciliation.period.endDate,
      )
    : "Selected period";


      function exportCsv() {
        if (!reconciliation) return;

        const generatedAt = getExportTimestamp();

        const rows: Array<Array<string | number>> = [
          ["MarvelMarts Financial Reconciliation"],
          ["Mode", "TEST MODE — Paystack Sandbox"],
          ["Period", periodLabel],
          ["Generated At", generatedAt],
          [],
          ["Metric", "Amount"],
          ["Gross Sales", reconciliation.grossSales],
          ["Customer Payments", reconciliation.customerPayments],
          ["Sale Allocations", reconciliation.saleAllocations],
          ["Marketplace Commission", reconciliation.marketplaceCommission],
          ["Shipping Revenue", reconciliation.shippingRevenue],
          ["Marketplace Revenue", reconciliation.totalRevenue],
          ["Processing Fees", reconciliation.processingFees],
          ["Total Expenses", reconciliation.totalExpenses],
          ["Net Revenue", reconciliation.netRevenue],
          ["Vendor Payable Created", reconciliation.vendorPayable],
          ["Orders", reconciliation.orderCount],
          ["Posted Transactions", reconciliation.postedTransactionCount],
        ];

        const csv = rows
          .map((row) => row.map(csvEscape).join(","))
          .join("\n");

        const blob = new Blob([`\uFEFF${csv}`], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `marvelmarts-financial-reconciliation-${toDateInputValue(
          new Date(),
        )}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }



        function printReconciliation() {
    if (!reconciliation) return;

    const generatedAt = getExportTimestamp();

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      return;
    }

    const metrics = [
      ["Gross Sales", reconciliation.grossSales],
      ["Customer Payments", reconciliation.customerPayments],
      ["Sale Allocations", reconciliation.saleAllocations],
      ["Marketplace Commission", reconciliation.marketplaceCommission],
      ["Shipping Revenue", reconciliation.shippingRevenue],
      ["Marketplace Revenue", reconciliation.totalRevenue],
      ["Processing Fees", reconciliation.processingFees],
      ["Total Expenses", reconciliation.totalExpenses],
      ["Net Revenue", reconciliation.netRevenue],
      ["Vendor Payable Created", reconciliation.vendorPayable],
      ["Orders", reconciliation.orderCount],
      ["Posted Transactions", reconciliation.postedTransactionCount],
    ];

    const metricRows = metrics
      .map(
        ([label, value]) => `
          <tr>
            <td>${label}</td>
            <td class="amount">
              ${
                typeof value === "number" &&
                !["Orders", "Posted Transactions"].includes(String(label))
                  ? formatFinancialAmount(value)
                  : Number(value).toLocaleString("en-NG")
              }
            </td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>MarvelMarts Financial Reconciliation</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .report {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              border-bottom: 3px solid #002B5B;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }

            .brand {
              font-size: 26px;
              font-weight: 800;
              color: #002B5B;
              margin: 0;
            }

            .title {
              margin: 6px 0 0;
              font-size: 20px;
              font-weight: 700;
              color: #111827;
            }

            .meta {
              margin-top: 18px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .meta-item {
              padding: 12px;
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }

            .meta-label {
              display: block;
              margin-bottom: 4px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #6b7280;
            }

            .meta-value {
              font-size: 13px;
              font-weight: 700;
              color: #002B5B;
            }

            .test-mode {
              color: #F7931E;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th {
              padding: 12px;
              text-align: left;
              background: #002B5B;
              color: white;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }

            td {
              padding: 11px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }

            .amount {
              text-align: right;
              font-weight: 700;
              font-variant-numeric: tabular-nums;
            }

            .footer {
              margin-top: 28px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
              line-height: 1.5;
            }

            @media print {
              body {
                padding: 20px;
              }

              .report {
                max-width: none;
              }
            }
          </style>
        </head>

        <body>
          <main class="report">
            <header class="header">
              <h1 class="brand">MarvelMarts</h1>
              <p class="title">Financial Reconciliation</p>

              <div class="meta">
                <div class="meta-item">
                  <span class="meta-label">Mode</span>
                  <span class="meta-value test-mode">
                    TEST MODE — Paystack Sandbox
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">Period</span>
                  <span class="meta-value">
                    ${periodLabel}
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">Generated At</span>
                  <span class="meta-value">
                    ${generatedAt}
                  </span>
                </div>
              </div>
            </header>

            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th style="text-align: right;">Amount / Count</th>
                </tr>
              </thead>

              <tbody>
                ${metricRows}
              </tbody>
            </table>

            <footer class="footer">
              MarvelMarts Financial Reconciliation Report<br />
              This report contains TEST MODE financial data from the Paystack
              Sandbox environment.
            </footer>
          </main>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  return (
    <section className="mt-10">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#F7931E]" />

              <h2 className="text-xl font-black uppercase tracking-tight text-[#002B5B]">
                Financial Reconciliation
              </h2>
            </div>

            <p className="mt-1 text-xs font-medium text-gray-400">
              Measure marketplace sales, platform revenue, expenses, and
              vendor obligations by business period.
            </p>
          </div>

            <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || !reconciliation}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#002B5B] transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              CSV
            </button>


              <button
              type="button"
              onClick={printReconciliation}
              disabled={loading || !reconciliation}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#002B5B] transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#002B5B] transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["week", "This Week"],
            ["month", "This Month"],
            ["custom", "Custom Range"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value as PeriodPreset)}
              className={`rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition ${
                preset === value
                  ? "bg-[#002B5B] text-white shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="mt-4 grid gap-4 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Start Date
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#002B5B] outline-none focus:border-[#F7931E]"
              />
            </label>

            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              End Date
              <input
                type="date"
                value={customEnd}
                min={customStart}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#002B5B] outline-none focus:border-[#F7931E]"
              />
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-[#002B5B]">{periodLabel}</p>

          <span className="inline-flex w-fit items-center rounded-full bg-[#FFF3E6] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#F7931E]">
            Test Mode — Paystack Sandbox
          </span>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-bold text-red-700">
              Reconciliation unavailable
            </p>

            <p className="mt-1 text-xs text-red-500">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white"
            >
              Try Again
            </button>
          </div>
        ) : reconciliation ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<ShoppingCart size={18} />}
                label="Gross Sales"
                value={formatFinancialAmount(reconciliation.grossSales)}
                description="Marketplace order value"
              />

              <MetricCard
                icon={<CircleDollarSign size={18} />}
                label="Marketplace Revenue"
                value={formatFinancialAmount(reconciliation.totalRevenue)}
                description="Commission + shipping revenue"
                emphasis
              />

              <MetricCard
                icon={<CreditCard size={18} />}
                label="Processing Fees"
                value={formatFinancialAmount(reconciliation.processingFees)}
                description="Fees absorbed by MarvelMarts"
              />

              <MetricCard
                icon={<Wallet size={18} />}
                label="Net Revenue"
                value={formatFinancialAmount(reconciliation.netRevenue)}
                description="Revenue after processing fees"
                emphasis
              />

              <MetricCard
                icon={<Store size={18} />}
                label="Vendor Payable Created"
                value={formatFinancialAmount(reconciliation.vendorPayable)}
                description="Payable generated in period"
              />

              <MetricCard
                icon={<Receipt size={18} />}
                label="Marketplace Commission"
                value={formatFinancialAmount(
                  reconciliation.marketplaceCommission,
                )}
                description="Commission revenue"
              />

              <MetricCard
                icon={<CircleDollarSign size={18} />}
                label="Shipping Revenue"
                value={formatFinancialAmount(reconciliation.shippingRevenue)}
                description="Shipping revenue recognized"
              />

              <MetricCard
                icon={<ClipboardList size={18} />}
                label="Orders"
                value={reconciliation.orderCount.toLocaleString("en-NG")}
                description={`${reconciliation.postedTransactionCount.toLocaleString("en-NG")} posted transactions`}
              />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 md:grid-cols-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Customer Payments
                </p>
                <p className="mt-1 text-lg font-black text-[#002B5B]">
                  {formatFinancialAmount(reconciliation.customerPayments)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Sale Allocations
                </p>
                <p className="mt-1 text-lg font-black text-[#002B5B]">
                  {formatFinancialAmount(reconciliation.saleAllocations)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Total Expenses
                </p>
                <p className="mt-1 text-lg font-black text-[#002B5B]">
                  {formatFinancialAmount(reconciliation.totalExpenses)}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}