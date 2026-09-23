"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  BookOpen,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";


type LedgerEntry = {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountSubtype: string | null;
  debit: number;
  credit: number;
  currency: string;
  description: string | null;
  vendorProfileId: string | null;
  userId: string | null;
  orderId: string | null;
  reference: string;
  transactionType: string;
  transactionStatus: string;
  transactionAmount: number;
  externalReference: string | null;
  occurredAt: string;
  createdAt: string;
  runningBalance: number;
};

type LedgerAccount = {
  id: string;
  code: string;
  name: string;
  type: string;
  subtype: string | null;
  currency: string;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
};

type LedgerResponse = {
  startDate: string | null;
  endDate: string | null;
  accountCode: string | null;
  transactionType: string | null;
  limit: number;
  entries: LedgerEntry[];
  accounts: LedgerAccount[];
};

const TRANSACTION_TYPES = [
  { value: "", label: "All Transaction Types" },
  { value: "SALE", label: "Sales" },
  { value: "PROCESSING_FEE", label: "Processing Fees" },
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function getLagosDateInputValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getLagosBoundary(dateValue: string, endOfDay = false) {
  const [year, month, day] = dateValue.split("-").map(Number);

  // Lagos is UTC+1.
  const hour = endOfDay ? 23 : 0;
  const minute = endOfDay ? 59 : 0;
  const second = endOfDay ? 59 : 0;
  const millisecond = endOfDay ? 999 : 0;

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour - 1,
      minute,
      second,
      millisecond,
    ),
  ).toISOString();
  
}


function getExportMetadata({
  startDate,
  endDate,
  accountCode,
  transactionType,
}: {
  startDate: string;
  endDate: string;
  accountCode: string;
  transactionType: string;
}) {
  const accountLabel = accountCode || "All Accounts";

  const transactionLabel =
    TRANSACTION_TYPES.find((type) => type.value === transactionType)?.label ||
    "All Transaction Types";

  return {
    period:
      startDate && endDate
        ? `${startDate} to ${endDate}`
        : "All available dates",
    account: accountLabel,
    transactionType: transactionLabel,
    generatedAt: new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date()),
  };
}

function buildLedgerRows(entries: LedgerEntry[]) {
  return entries.map((entry) => ({
    Date: formatDate(entry.occurredAt),
    Account: `${entry.accountCode} — ${entry.accountName}`,
    Description: entry.description || "",
    Reference: entry.reference,
    "Transaction Type": entry.transactionType,
    Debit: entry.debit,
    Credit: entry.credit,
    "Running Balance": entry.runningBalance,
  }));
}

export default function FinancialGeneralLedger() {
  const today = useMemo(() => new Date(), []);

  const [startDate, setStartDate] = useState(
    getLagosDateInputValue(today),
  );

  const [endDate, setEndDate] = useState(
    getLagosDateInputValue(today),
  );

  const [accountCode, setAccountCode] = useState("");
  const [transactionType, setTransactionType] = useState("");

  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLedger() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (startDate) {
        params.set(
          "start",
          getLagosBoundary(startDate, false),
        );
      }

      if (endDate) {
        params.set(
          "end",
          getLagosBoundary(endDate, true),
        );
      }

      if (accountCode) {
        params.set("accountCode", accountCode);
      }

      if (transactionType) {
        params.set("transactionType", transactionType);
      }

      params.set("limit", "500");

      const response = await fetch(
        `/api/admins/finance/general-ledger?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error || "Unable to load general ledger.",
        );
      }

      setLedger(data.ledger);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load general ledger.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLedger();
    // Intentionally load only when filters are submitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accounts = ledger?.accounts ?? [];
  const entries = ledger?.entries ?? [];

  const totals = useMemo(() => {
    return entries.reduce(
      (result, entry) => {
        result.debit += entry.debit;
        result.credit += entry.credit;
        return result;
      },
      { debit: 0, credit: 0 },
    );
  }, [entries]);

  const selectedAccount = accounts.find(
    (account) => account.code === accountCode,
  );


    const exportMetadata = getExportMetadata({
    startDate,
    endDate,
    accountCode,
    transactionType,
  });

  function exportCsv() {
    if (!entries.length) return;

    const rows = buildLedgerRows(entries);

    const metadataRows = [
      ["MarvelMarts General Ledger"],
      ["TEST MODE — PAYSTACK SANDBOX"],
      [],
      ["Period", exportMetadata.period],
      ["Account", exportMetadata.account],
      ["Transaction Type", exportMetadata.transactionType],
      ["Generated At", exportMetadata.generatedAt],
      [],
    ];

    const headers = [
      "Date",
      "Account",
      "Description",
      "Reference",
      "Transaction Type",
      "Debit",
      "Credit",
      "Running Balance",
    ];

    const csvRows = rows.map((row) => [
      row.Date,
      row.Account,
      row.Description,
      row.Reference,
      row["Transaction Type"],
      row.Debit,
      row.Credit,
      row["Running Balance"],
    ]);

    csvRows.push([]);
    csvRows.push([
      "",
      "",
      "",
      "",
      "Period Totals",
      totals.debit,
      totals.credit,
      totals.debit === totals.credit ? "BALANCED" : "CHECK",
    ]);

    const allRows = [...metadataRows, headers, ...csvRows];

    const csv = allRows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `marvelmarts-general-ledger-${startDate || "all"}-${endDate || "all"}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (!entries.length) return;

    const rows = buildLedgerRows(entries);

    const workbook = XLSX.utils.book_new();

    const metadataSheet = XLSX.utils.aoa_to_sheet([
      ["MarvelMarts General Ledger"],
      ["TEST MODE — PAYSTACK SANDBOX"],
      [],
      ["Period", exportMetadata.period],
      ["Account", exportMetadata.account],
      ["Transaction Type", exportMetadata.transactionType],
      ["Generated At", exportMetadata.generatedAt],
      [],
      ["Period Totals"],
      ["Total Debits", totals.debit],
      ["Total Credits", totals.credit],
      [
        "Ledger Status",
        totals.debit === totals.credit ? "BALANCED" : "CHECK",
      ],
    ]);

    const ledgerSheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, metadataSheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, "Ledger");

    metadataSheet["!cols"] = [
      { wch: 24 },
      { wch: 40 },
    ];

    ledgerSheet["!cols"] = [
      { wch: 24 },
      { wch: 34 },
      { wch: 42 },
      { wch: 34 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];

    XLSX.writeFile(
      workbook,
      `marvelmarts-general-ledger-${startDate || "all"}-${endDate || "all"}.xlsx`,
    );
  }

  function printLedger() {
    if (!entries.length) return;

    window.print();
  }

  return (
      <>
      <style jsx global>{`
        @media print {
            body {
            background: white !important;
            }

            body * {
            visibility: hidden;
            }

            #marvelmarts-general-ledger,
            #marvelmarts-general-ledger * {
            visibility: visible;
            }

            #marvelmarts-general-ledger {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            }

            #marvelmarts-general-ledger .no-print {
            display: none !important;
            }

            #marvelmarts-general-ledger {
            box-shadow: none !important;
            border: 0 !important;
            }

            #marvelmarts-general-ledger table {
            min-width: 0 !important;
            width: 100% !important;
            }

            #marvelmarts-general-ledger th,
            #marvelmarts-general-ledger td {
            padding: 6px 8px !important;
            font-size: 9px !important;
            }
        }
        `}</style>
    <section
        id="marvelmarts-general-ledger"
        className="mt-10"
        >
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[#002B5B] p-3 text-white">
                <BookOpen size={20} />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight text-[#002B5B]">
                  General Ledger
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-400">
                  Detailed double-entry accounting activity by account
                  and transaction.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600">
                TEST MODE — PAYSTACK SANDBOX
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                type="button"
                onClick={exportCsv}
                disabled={loading || entries.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-[#002B5B] hover:text-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                <Download size={14} />
                CSV
                </button>

                <button
                type="button"
                onClick={exportExcel}
                disabled={loading || entries.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-[#002B5B] hover:text-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                <FileSpreadsheet size={14} />
                Excel
                </button>

                <button
                type="button"
                onClick={printLedger}
                disabled={loading || entries.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-[#002B5B] hover:text-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                <Printer size={14} />
                Print
                </button>
            </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-100 bg-gray-50/70 p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={15} className="text-[#002B5B]" />

            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#002B5B]">
              Ledger Filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#002B5B]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-[#002B5B]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Account
              </label>

              <div className="relative">
                <select
                  value={accountCode}
                  onChange={(event) =>
                    setAccountCode(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium outline-none transition focus:border-[#002B5B]"
                >
                  <option value="">All Accounts</option>

                  {accounts.map((account) => (
                    <option
                      key={account.code}
                      value={account.code}
                    >
                      {account.code} — {account.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Transaction Type
              </label>

              <div className="relative">
                <select
                  value={transactionType}
                  onChange={(event) =>
                    setTransactionType(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium outline-none transition focus:border-[#002B5B]"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={loadLedger}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002B5B] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#001f42] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Search size={16} />
                )}

                {loading ? "Loading..." : "Apply Filters"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={loadLedger}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 transition hover:text-[#002B5B] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Ledger
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Account summary */}
        {selectedAccount && !loading && (
          <div className="grid grid-cols-2 gap-3 border-b border-gray-100 p-5 md:grid-cols-4 md:p-6">
            <SummaryItem
              label="Opening Balance"
              value={selectedAccount.openingBalance}
            />

            <SummaryItem
              label="Period Debits"
              value={selectedAccount.periodDebit}
            />

            <SummaryItem
              label="Period Credits"
              value={selectedAccount.periodCredit}
            />

            <SummaryItem
              label="Closing Balance"
              value={selectedAccount.closingBalance}
            />
          </div>
        )}

        {/* Ledger */}
        <div className="relative">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  size={28}
                  className="animate-spin text-[#002B5B]"
                />

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Loading general ledger...
                </p>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-4">
                <BookOpen
                  size={22}
                  className="text-gray-400"
                />
              </div>

              <h3 className="text-sm font-black text-[#002B5B]">
                No ledger entries found
              </h3>

              <p className="mt-1 max-w-md text-xs text-gray-400">
                No posted accounting entries match the selected
                filters and period.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1200px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Account
                      </th>

                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Description
                      </th>

                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Reference
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Debit
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Credit
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Running Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-50 transition hover:bg-gray-50/70"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-gray-500">
                          {formatDate(entry.occurredAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-mono text-xs font-black text-[#002B5B]">
                            {entry.accountCode}
                          </div>

                          <div className="mt-0.5 text-xs font-medium text-gray-500">
                            {entry.accountName}
                          </div>
                        </td>

                        <td className="max-w-[300px] px-5 py-4">
                          <div className="text-xs font-semibold text-gray-700">
                            {entry.description || "—"}
                          </div>

                          {entry.orderId && (
                            <div className="mt-1 font-mono text-[10px] text-gray-400">
                              Order: {entry.orderId}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[230px] font-mono text-[10px] font-bold text-gray-500">
                            {entry.reference}
                          </div>

                          <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-gray-300">
                            {entry.transactionType}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-bold text-gray-700">
                          {entry.debit > 0
                            ? formatNaira(entry.debit)
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-bold text-gray-700">
                          {entry.credit > 0
                            ? formatNaira(entry.credit)
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-black text-[#002B5B]">
                          {formatNaira(entry.runningBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="bg-gray-50">
                      <td
                        colSpan={4}
                        className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#002B5B]"
                      >
                        Period Totals
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs font-black text-[#002B5B]">
                        {formatNaira(totals.debit)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs font-black text-[#002B5B]">
                        {formatNaira(totals.credit)}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs font-black text-[#002B5B]">
                        {totals.debit === totals.credit
                          ? "BALANCED"
                          : "CHECK"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs font-black text-[#002B5B]">
                          {entry.accountCode}
                        </div>

                        <div className="mt-0.5 text-xs font-bold text-gray-700">
                          {entry.accountName}
                        </div>
                      </div>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-gray-500">
                        {entry.transactionType}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-medium leading-5 text-gray-600">
                      {entry.description || "—"}
                    </p>

                    <div className="mt-3 rounded-xl bg-gray-50 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            Debit
                          </p>

                          <p className="mt-1 font-mono text-xs font-bold text-gray-700">
                            {entry.debit > 0
                              ? formatNaira(entry.debit)
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            Credit
                          </p>

                          <p className="mt-1 font-mono text-xs font-bold text-gray-700">
                            {entry.credit > 0
                              ? formatNaira(entry.credit)
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            Running Balance
                          </p>

                          <p className="mt-1 font-mono text-xs font-black text-[#002B5B]">
                            {formatNaira(entry.runningBalance)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            Date
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-600">
                            {formatDate(entry.occurredAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Reference
                      </p>

                      <p className="mt-1 break-all font-mono text-[10px] font-bold text-gray-500">
                        {entry.reference}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-[#002B5B]">
                      Total Debits
                    </span>

                    <span className="font-mono font-black text-[#002B5B]">
                      {formatNaira(totals.debit)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-[#002B5B]">
                      Total Credits
                    </span>

                    <span className="font-mono font-black text-[#002B5B]">
                      {formatNaira(totals.credit)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm font-black text-[#002B5B]">
        {formatNaira(value)}
      </p>
    </div>
  );
}