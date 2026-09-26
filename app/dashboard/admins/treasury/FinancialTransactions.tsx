"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Printer,
  Receipt,
} from "lucide-react";

import { formatNaira } from "@/app/lib/FormatNaira";

type FinancialTransaction = {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  orderId: string | null;
  orderNumber: string | null;
  vendorProfileId: string | null;
  userId: string | null;
  externalReference: string | null;
  occurredAt: string;
  createdAt: string;
};


function formatFinancialAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type TransactionsResponse = {
  success: boolean;
  transactions: FinancialTransaction[];
  error?: string;
};

function getTransactionLabel(transaction: FinancialTransaction) {
  if (transaction.reference.startsWith("SALE-PAYMENT-")) {
    return "Customer Payment";
  }

  if (transaction.reference.startsWith("SALE-ALLOCATION-")) {
    return "Sale Allocation";
  }

  if (
    transaction.reference.startsWith("PROCESSING-FEE-ORDER-")
  ) {
    return "Processing Fee";
  }

  return transaction.type.replaceAll("_", " ");
}

function getTransactionIcon(transaction: FinancialTransaction) {
  if (
    transaction.reference.startsWith("PROCESSING-FEE-ORDER-")
  ) {
    return <ArrowDownRight size={17} />;
  }

  if (transaction.reference.startsWith("SALE-PAYMENT-")) {
    return <ArrowUpRight size={17} />;
  }

  if (transaction.reference.startsWith("SALE-ALLOCATION-")) {
    return <Receipt size={17} />;
  }

  return <FileText size={17} />;
}

function getTransactionIconStyle(
  transaction: FinancialTransaction
) {
  if (
    transaction.reference.startsWith("PROCESSING-FEE-ORDER-")
  ) {
    return "bg-red-50 text-red-600";
  }

  if (transaction.reference.startsWith("SALE-PAYMENT-")) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (transaction.reference.startsWith("SALE-ALLOCATION-")) {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-gray-100 text-gray-600";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function extractOrderNumber(
  description: string | null
) {
  if (!description) {
    return null;
  }

  const match = description.match(
    /\bMARVEL-\d{4}-\d{6}\b/
  );

  return match?.[0] ?? null;
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

export default function FinancialTransactions() {
  const [transactions, setTransactions] = useState<
    FinancialTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/admins/finance/transactions",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as TransactionsResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Unable to load financial transactions."
          );
        }

        if (!cancelled) {
          setTransactions(result.transactions);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load financial transactions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, []);


    function exportCsv() {
    if (transactions.length === 0) return;

    const generatedAt = getExportTimestamp();

    const rows: Array<Array<string | number>> = [
      ["MarvelMarts Financial Transactions"],
      ["Mode", "TEST MODE — Paystack Sandbox"],
      ["Report", "Latest 10 Posted Financial Transactions"],
      ["Generated At", generatedAt],
      [],
      [
        "Transaction",
        "Reference",
        "Amount",
        "Currency",
        "Status",
        "Order",
        "Description",
        "Occurred At",
      ],
      ...transactions.map((transaction) => [
        getTransactionLabel(transaction),
        transaction.reference,
        transaction.amount,
        transaction.currency,
        transaction.status,
       transaction.orderNumber ??
        extractOrderNumber(transaction.description) ?? "",
        transaction.description ?? "",
        formatDate(transaction.occurredAt),
      ]),
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
    link.download = `marvelmarts-financial-transactions-${new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Africa/Lagos",
      },
    ).format(new Date())}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }


    function printTransactions() {
    if (transactions.length === 0) return;

    const generatedAt = getExportTimestamp();

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=800",
    );

    if (!printWindow) {
      return;
    }

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const transactionRows = transactions
      .map((transaction) => {
        const orderNumber =
         transaction.orderNumber ??
         extractOrderNumber(transaction.description);

        return `
          <tr>
            <td>${escapeHtml(getTransactionLabel(transaction))}</td>
            <td class="reference">
              ${escapeHtml(transaction.reference)}
            </td>
            <td class="amount">
              ${escapeHtml(formatFinancialAmount(transaction.amount))}
            </td>
            <td>${escapeHtml(transaction.currency)}</td>
            <td>
              <span class="status">
                ${escapeHtml(transaction.status)}
              </span>
            </td>
            <td>
              ${orderNumber ? escapeHtml(orderNumber) : "—"}
            </td>
            <td>
              ${escapeHtml(
                transaction.description ||
                  "Financial transaction",
              )}
            </td>
            <td class="date">
              ${escapeHtml(formatDate(transaction.occurredAt))}
            </td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>MarvelMarts Financial Transactions</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 36px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .report {
              max-width: 1200px;
              margin: 0 auto;
            }

            .header {
              border-bottom: 3px solid #002B5B;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }

            .brand {
              margin: 0;
              font-size: 26px;
              font-weight: 800;
              color: #002B5B;
            }

            .title {
              margin: 6px 0 0;
              font-size: 20px;
              font-weight: 700;
              color: #111827;
            }

            .meta {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 18px;
            }

            .meta-item {
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f8fafc;
            }

            .meta-label {
              display: block;
              margin-bottom: 4px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #6b7280;
            }

            .meta-value {
              font-size: 12px;
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
              padding: 11px 9px;
              text-align: left;
              background: #002B5B;
              color: #ffffff;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            td {
              padding: 10px 9px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 10px;
              vertical-align: top;
            }

            tbody tr:nth-child(even) {
              background: #f8fafc;
            }

            .reference {
              font-family: "Courier New", monospace;
              font-size: 9px;
            }

            .amount {
              text-align: right;
              font-weight: 700;
              white-space: nowrap;
            }

            .status {
              font-weight: 700;
              color: #047857;
            }

            .date {
              white-space: nowrap;
            }

            .footer {
              margin-top: 24px;
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              font-size: 9px;
              line-height: 1.5;
              color: #6b7280;
            }

            @media print {
              body {
                padding: 15px;
              }

              .report {
                max-width: none;
              }

              thead {
                display: table-header-group;
              }

              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <main class="report">
            <header class="header">
              <h1 class="brand">MarvelMarts</h1>
              <p class="title">Financial Transactions</p>

              <div class="meta">
                <div class="meta-item">
                  <span class="meta-label">Mode</span>
                  <span class="meta-value test-mode">
                    TEST MODE — Paystack Sandbox
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">Report</span>
                  <span class="meta-value">
                    Latest 10 Posted Financial Transactions
                  </span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">Generated At</span>
                  <span class="meta-value">
                    ${escapeHtml(generatedAt)}
                  </span>
                </div>
              </div>
            </header>

            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Reference</th>
                  <th style="text-align: right;">Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                ${transactionRows}
              </tbody>
            </table>

            <footer class="footer">
              MarvelMarts Financial Transactions Report<br />
              This report contains TEST MODE financial data from the
              Paystack Sandbox environment.
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
    <section className="mb-10">
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
          Accounting Activity
        </p>

        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#002B5B]">
              Recent Financial Transactions
            </h2>

            <p className="mt-1 text-xs font-semibold text-gray-400">
              Latest posted accounting transactions
            </p>
          </div>


            <button
              type="button"
              onClick={printTransactions}
              disabled={loading || transactions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#002B5B] transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={14} />
              Print
            </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || transactions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#002B5B] transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              CSV
            </button>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <Clock3 size={14} />
              Latest 10
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-black text-red-600">
              Financial transactions unavailable
            </p>

            <p className="mt-1 text-xs font-semibold text-red-500">
              {error}
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard
              size={28}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-black text-gray-500">
              No posted financial transactions
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Reference
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => {
                    const orderNumber =
                    transaction.orderNumber ??
                    extractOrderNumber(transaction.description);

                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTransactionIconStyle(
                                transaction
                              )}`}
                            >
                              {getTransactionIcon(
                                transaction
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-black text-gray-800">
                                {getTransactionLabel(
                                  transaction
                                )}
                              </p>

                              <p className="mt-0.5 max-w-[260px] truncate text-[10px] font-medium text-gray-400">
                                {transaction.description ||
                                  "Financial transaction"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <code className="text-[10px] font-bold text-gray-500">
                            {transaction.reference}
                          </code>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-gray-900">
                            {formatFinancialAmount(transaction.amount
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                            {transaction.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {orderNumber ? (
                            <span className="text-[10px] font-black text-[#002B5B]">
                              {orderNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-300">
                              —
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-[10px] font-semibold text-gray-400">
                          {formatDate(
                            transaction.occurredAt
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 lg:hidden">
              {transactions.map((transaction) => {
                const orderNumber =
                transaction.orderNumber ??
                extractOrderNumber(transaction.description);

                return (
                  <div
                    key={transaction.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTransactionIconStyle(
                          transaction
                        )}`}
                      >
                        {getTransactionIcon(
                          transaction
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-800">
                              {getTransactionLabel(
                                transaction
                              )}
                            </p>

                            <p className="mt-1 truncate text-[10px] font-bold text-gray-400">
                              {transaction.reference}
                            </p>
                          </div>

                          <span className="whitespace-nowrap text-sm font-black text-gray-900">
                            {formatNaira(
                              transaction.amount
                            )}
                          </span>
                        </div>

                        <p className="mt-3 text-[10px] font-medium leading-5 text-gray-400">
                          {transaction.description ||
                            "Financial transaction"}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                            {transaction.status}
                          </span>

                          {orderNumber && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black tracking-wider text-[#002B5B]">
                              {orderNumber}
                            </span>
                          )}

                          <span className="text-[9px] font-semibold text-gray-400">
                            {formatDate(
                              transaction.occurredAt
                            )}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={15}
                        className="mt-2 shrink-0 text-gray-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}