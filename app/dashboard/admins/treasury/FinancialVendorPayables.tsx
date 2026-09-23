"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import * as XLSX from "xlsx";

type VendorPayable = {
  vendorProfileId: string;
  vendor: {
    id: string;
    storeName: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string | null;
  } | null;
  totalPayableCreated: string;
  totalSettled: string;
  outstandingPayable: string;
  currency: string;
  lastActivityAt: string | null;
};

type VendorPayablesResponse = {
  success: boolean;
  vendorPayables: {
    accountCode: string;
    accountName: string;
    currency: string;
    summary: {
      totalPayableCreated: string;
      totalSettled: string;
      totalOutstanding: string;
      vendorCount: number;
    };
    vendors: VendorPayable[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type SortBy =
  | "payableCreated"
  | "settled"
  | "outstanding"
  | "lastActivity";

type SortOrder = "asc" | "desc";

function formatNaira(value: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return "â€”";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function FinancialVendorPayables() {
  const [data, setData] =
    useState<VendorPayablesResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(25);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState<SortBy>("outstanding");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("desc");

  const loadVendorPayables =
    async (
      requestedPage = page,
      requestedLimit = limit,
      requestedSearch = search,
      requestedSortBy = sortBy,
      requestedSortOrder = sortOrder
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams({
            page: String(
              requestedPage
            ),
            limit: String(
              requestedLimit
            ),
            sortBy:
              requestedSortBy,
            sortOrder:
              requestedSortOrder,
          });

        if (requestedSearch) {
          params.set(
            "search",
            requestedSearch
          );
        }

        const response =
          await fetch(
            `/api/admins/finance/vendor-payables?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          (await response.json()) as
            | VendorPayablesResponse
            | {
                success?: false;
                message?: string;
              };

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            "message" in result &&
              result.message
              ? result.message
              : "Unable to load vendor payables."
          );
        }

        setData(
          result as VendorPayablesResponse
        );

        setPage(
          result.vendorPayables.pagination.page
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load vendor payables."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadVendorPayables(
      1,
      limit,
      "",
      sortBy,
      sortOrder
    );
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vendors =
    data?.vendorPayables.vendors ?? [];

  const summary =
    data?.vendorPayables.summary;

  const pagination =
    data?.vendorPayables.pagination;

  const pageStart =
    pagination && pagination.total > 0
      ? (pagination.page - 1) *
          pagination.limit +
        1
      : 0;

  const pageEnd =
    pagination && pagination.total > 0
      ? Math.min(
          pagination.page *
            pagination.limit,
          pagination.total
        )
      : 0;

  const canGoPrevious =
    Boolean(
      pagination &&
        pagination.page > 1
    );

  const canGoNext =
    Boolean(
      pagination &&
        pagination.page <
          pagination.totalPages
    );

  const pageNumbers =
    useMemo(() => {
      if (!pagination) {
        return [];
      }

      const totalPages =
        pagination.totalPages;

      if (totalPages <= 1) {
        return totalPages === 1
          ? [1]
          : [];
      }

      const currentPage =
        pagination.page;

      const pages = new Set<number>();

      pages.add(1);
      pages.add(totalPages);
      pages.add(currentPage);
      pages.add(
        Math.max(
          1,
          currentPage - 1
        )
      );
      pages.add(
        Math.min(
          totalPages,
          currentPage + 1
        )
      );

      return Array.from(
        pages
      ).sort(
        (a, b) => a - b
      );
    }, [pagination]);

  const handleSearch =
    () => {
      const normalized =
        searchInput.trim();

      setSearch(
        normalized
      );

      setPage(1);

      void loadVendorPayables(
        1,
        limit,
        normalized,
        sortBy,
        sortOrder
      );
    };

  const handleSortChange =
    (
      nextSortBy: SortBy
    ) => {
      setSortBy(
        nextSortBy
      );

      setPage(1);

      void loadVendorPayables(
        1,
        limit,
        search,
        nextSortBy,
        sortOrder
      );
    };

  const handleSortOrder =
    () => {
      const nextOrder =
        sortOrder === "desc"
          ? "asc"
          : "desc";

      setSortOrder(
        nextOrder
      );

      setPage(1);

      void loadVendorPayables(
        1,
        limit,
        search,
        sortBy,
        nextOrder
      );
    };

  const handleLimitChange =
    (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const nextLimit =
        Number(
          event.target.value
        );

      setLimit(
        nextLimit
      );

      setPage(1);

      void loadVendorPayables(
        1,
        nextLimit,
        search,
        sortBy,
        sortOrder
      );
    };

  const handlePageChange =
    (nextPage: number) => {
      if (
        nextPage < 1 ||
        (pagination &&
          nextPage >
            pagination.totalPages)
      ) {
        return;
      }

      setPage(
        nextPage
      );

      void loadVendorPayables(
        nextPage,
        limit,
        search,
        sortBy,
        sortOrder
      );
    };


  const [exporting, setExporting] = useState<
    "csv" | "excel" | "print" | null
  >(null);

  const fetchAllExportVendors = async () => {
    const exportLimit = 100;
    const firstParams = new URLSearchParams({
      page: "1",
      limit: String(exportLimit),
      sortBy,
      sortOrder,
    });

    if (search) {
      firstParams.set("search", search);
    }

    const firstResponse = await fetch(
      `/api/admins/finance/vendor-payables?${firstParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const firstResult =
      (await firstResponse.json()) as VendorPayablesResponse | {
        success?: false;
        message?: string;
      };

    if (
      !firstResponse.ok ||
      !firstResult.success ||
      !("vendorPayables" in firstResult)
    ) {
      throw new Error(
        "message" in firstResult && firstResult.message
          ? firstResult.message
          : "Unable to prepare vendor payables export."
      );
    }

    const payload = firstResult as VendorPayablesResponse;
    const allVendors = [...payload.vendorPayables.vendors];
    const totalPages = payload.vendorPayables.pagination.totalPages;

    for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(exportLimit),
        sortBy,
        sortOrder,
      });

      if (search) {
        params.set("search", search);
      }

      const response = await fetch(
        `/api/admins/finance/vendor-payables?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        (await response.json()) as VendorPayablesResponse | {
          success?: false;
          message?: string;
        };

      if (
        !response.ok ||
        !result.success ||
        !("vendorPayables" in result)
      ) {
        throw new Error(
          "message" in result && result.message
            ? result.message
            : "Unable to prepare vendor payables export."
        );
      }

      allVendors.push(
        ...(result as VendorPayablesResponse).vendorPayables.vendors
      );
    }

    return {
      accountCode: payload.vendorPayables.accountCode,
      accountName: payload.vendorPayables.accountName,
      currency: payload.vendorPayables.currency,
      vendors: allVendors,
    };
  };

  const buildExportRows = (exportVendors: VendorPayable[]) =>
    exportVendors.map((vendor) => ({
      Vendor: vendor.vendor?.storeName ?? "Unknown Vendor",
      Contact: vendor.vendor?.name ?? "—",
      Email: vendor.vendor?.email ?? "—",
      "Payable Created": Number(vendor.totalPayableCreated),
      Settled: Number(vendor.totalSettled),
      "Outstanding Payable": Number(vendor.outstandingPayable),
      Currency: vendor.currency,
      "Last Activity": vendor.lastActivityAt
        ? new Date(vendor.lastActivityAt).toLocaleString("en-NG")
        : "—",
    }));

  const calculateExportSummary = (exportVendors: VendorPayable[]) => ({
    totalPayableCreated: exportVendors.reduce(
      (total, vendor) => total + Number(vendor.totalPayableCreated),
      0
    ),
    totalSettled: exportVendors.reduce(
      (total, vendor) => total + Number(vendor.totalSettled),
      0
    ),
    totalOutstanding: exportVendors.reduce(
      (total, vendor) => total + Number(vendor.outstandingPayable),
      0
    ),
    vendorCount: exportVendors.length,
  });

  const escapeCsv = (value: unknown) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const generateFileName = (extension: string) =>
    `MarvelMarts_Vendor_Payables_${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;

  const handleExport = async (format: "csv" | "excel" | "print") => {
    try {
      setExporting(format);

      const exported = await fetchAllExportVendors();
      const rows = buildExportRows(exported.vendors);
      const exportSummary = calculateExportSummary(exported.vendors);
      const generatedAt = new Date();

      if (format === "csv") {
        const headers = Object.keys(rows[0] ?? {
          Vendor: "",
          Contact: "",
          Email: "",
          "Payable Created": "",
          Settled: "",
          "Outstanding Payable": "",
          Currency: "",
          "Last Activity": "",
        });

        const csvLines = [
          ["MarvelMarts Vendor Payables"].map(escapeCsv).join(","),
          ["TEST MODE — Paystack Sandbox"].map(escapeCsv).join(","),
          [`Account ${exported.accountCode} — ${exported.accountName}`]
            .map(escapeCsv)
            .join(","),
          [`Search: ${search || "All vendors"}`].map(escapeCsv).join(","),
          [`Sort: ${sortBy} (${sortOrder})`].map(escapeCsv).join(","),
          [`Generated: ${generatedAt.toLocaleString("en-NG")}`]
            .map(escapeCsv)
            .join(","),
          "",
          headers.map(escapeCsv).join(","),
          ...rows.map((row) =>
            headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(",")
          ),
          "",
          [
            "SUMMARY",
            `Vendor Count: ${exportSummary.vendorCount}`,
            `Payable Created: ${exportSummary.totalPayableCreated.toFixed(2)}`,
            `Settled: ${exportSummary.totalSettled.toFixed(2)}`,
            `Outstanding: ${exportSummary.totalOutstanding.toFixed(2)}`,
          ]
            .map(escapeCsv)
            .join(","),
        ];

        const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = generateFileName("csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

      if (format === "excel") {
        const worksheetRows = [
          ["MarvelMarts Vendor Payables"],
          ["TEST MODE — Paystack Sandbox"],
          [`Account ${exported.accountCode} — ${exported.accountName}`],
          [`Search: ${search || "All vendors"}`],
          [`Sort: ${sortBy} (${sortOrder})`],
          [`Generated: ${generatedAt.toLocaleString("en-NG")}`],
          [],
          Object.keys(rows[0] ?? {
            Vendor: "",
            Contact: "",
            Email: "",
            "Payable Created": "",
            Settled: "",
            "Outstanding Payable": "",
            Currency: "",
            "Last Activity": "",
          }),
          ...rows.map((row) => Object.values(row)),
          [],
          ["SUMMARY"],
          ["Vendor Count", exportSummary.vendorCount],
          ["Payable Created", exportSummary.totalPayableCreated],
          ["Settled", exportSummary.totalSettled],
          ["Outstanding Payable", exportSummary.totalOutstanding],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
        worksheet["!cols"] = [
          { wch: 28 },
          { wch: 24 },
          { wch: 32 },
          { wch: 18 },
          { wch: 18 },
          { wch: 20 },
          { wch: 12 },
          { wch: 24 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Payables");
        XLSX.writeFile(workbook, generateFileName("xlsx"));
        return;
      }

      const money = (value: number) =>
        formatNaira(value).replace("₦", "₦");

      const tableRows = exported.vendors
        .map(
          (vendor) => `
            <tr>
              <td>${vendor.vendor?.storeName ?? "Unknown Vendor"}</td>
              <td>${vendor.vendor?.name ?? "—"}</td>
              <td class="amount">${money(Number(vendor.totalPayableCreated))}</td>
              <td class="amount">${money(Number(vendor.totalSettled))}</td>
              <td class="amount">${money(Number(vendor.outstandingPayable))}</td>
              <td>${formatDate(vendor.lastActivityAt)}</td>
            </tr>`
        )
        .join("");

      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        throw new Error("Please allow pop-ups to print the vendor payables report.");
      }

      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>MarvelMarts Vendor Payables</title>
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 32px;
                color: #172033;
                font-family: Arial, Helvetica, sans-serif;
                background: #fff;
              }
              h1 { margin: 0 0 6px; color: #002B5B; font-size: 24px; }
              h2 { margin: 0 0 20px; color: #667085; font-size: 12px; font-weight: 600; }
              .meta {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 24px;
              }
              .meta div {
                border: 1px solid #e5e7eb;
                padding: 10px 12px;
                font-size: 11px;
              }
              .label {
                display: block;
                margin-bottom: 4px;
                color: #667085;
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
              }
              .summary {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 24px;
              }
              .card {
                border: 1px solid #e5e7eb;
                padding: 14px;
              }
              .card strong {
                display: block;
                margin-top: 6px;
                color: #002B5B;
                font-size: 18px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
              }
              th {
                padding: 9px 7px;
                border-bottom: 2px solid #002B5B;
                color: #667085;
                text-align: left;
                text-transform: uppercase;
                font-size: 9px;
              }
              td {
                padding: 9px 7px;
                border-bottom: 1px solid #edf0f3;
              }
              .amount { text-align: right; white-space: nowrap; }
              .footer {
                margin-top: 24px;
                color: #667085;
                font-size: 9px;
              }
              @media print {
                body { padding: 16px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>MarvelMarts Vendor Payables</h1>
            <h2>Accounting Liability Report</h2>

            <div class="meta">
              <div><span class="label">Mode</span>TEST MODE — Paystack Sandbox</div>
              <div><span class="label">Account</span>${exported.accountCode} — ${exported.accountName}</div>
              <div><span class="label">Generated</span>${generatedAt.toLocaleString("en-NG")}</div>
              <div><span class="label">Search</span>${search || "All vendors"}</div>
              <div><span class="label">Sort</span>${sortBy} (${sortOrder})</div>
              <div><span class="label">Vendors</span>${exportSummary.vendorCount}</div>
            </div>

            <div class="summary">
              <div class="card">
                <span class="label">Payable Created</span>
                <strong>${money(exportSummary.totalPayableCreated)}</strong>
              </div>
              <div class="card">
                <span class="label">Settled</span>
                <strong>${money(exportSummary.totalSettled)}</strong>
              </div>
              <div class="card">
                <span class="label">Outstanding Payable</span>
                <strong>${money(exportSummary.totalOutstanding)}</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Contact</th>
                  <th class="amount">Payable Created</th>
                  <th class="amount">Settled</th>
                  <th class="amount">Outstanding</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>

            <p class="footer">
              MarvelMarts financial reporting • Sandbox/test data only • Generated ${generatedAt.toLocaleString("en-NG")}
            </p>

            <script>
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate vendor payables report."
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            Accounting Liabilities
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#002B5B]">
            Vendor Payables
          </h2>

          <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-gray-400">
            Ledger-backed vendor obligations created
            through marketplace transactions and reduced
            through financial settlements.
          </p>
        </div>

        <div className=" flex flex-wrap items-center justify-end gap-1 mr-[100px]">
          <button
            type="button"
            onClick={() => {
              void handleExport("csv");
            }}
            disabled={loading || exporting !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#002B5B] shadow-sm transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={14} />
            {exporting === "csv" ? "Exporting..." : "CSV"}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleExport("excel");
            }}
            disabled={loading || exporting !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#002B5B] shadow-sm transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            {exporting === "excel" ? "Exporting..." : "Excel"}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleExport("print");
            }}
            disabled={loading || exporting !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-[#002B5B] shadow-sm transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={14} />
            {exporting === "print" ? "Preparing..." : "Print"}
          </button>

          <button
            type="button"
            onClick={() => {
              void loadVendorPayables(
                page,
                limit,
                search,
                sortBy,
                sortOrder
              );
            }}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#002B5B] shadow-sm transition hover:border-[#002B5B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : undefined
              }
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-800">
              Test Mode â€” Paystack Sandbox
            </p>

            <p className="mt-1 text-xs font-medium leading-5 text-amber-700">
              Vendor payable figures currently reflect
              sandbox financial transactions and should
              not be treated as production liabilities.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Payable Created
            </p>

            <div className="rounded-lg bg-blue-50 p-2 text-[#002B5B]">
              <Building2 size={17} />
            </div>
          </div>

          <p className="text-2xl font-black tracking-tight text-[#002B5B]">
            {loading && !summary
              ? "â€”"
              : formatNaira(
                  summary?.totalPayableCreated ??
                    "0"
                )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Settled
            </p>

            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Wallet size={17} />
            </div>
          </div>

          <p className="text-2xl font-black tracking-tight text-[#002B5B]">
            {loading && !summary
              ? "â€”"
              : formatNaira(
                  summary?.totalSettled ??
                    "0"
                )}
          </p>
        </div>

        <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-700">
              Outstanding Payable
            </p>

            <div className="rounded-lg bg-white p-2 text-[#F7931E]">
              <Wallet size={17} />
            </div>
          </div>

          <p className="text-2xl font-black tracking-tight text-[#002B5B]">
            {loading && !summary
              ? "â€”"
              : formatNaira(
                  summary?.totalOutstanding ??
                    "0"
                )}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={
                searchInput
              }
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search vendor or store..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="h-10 rounded-lg bg-[#002B5B] px-5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#001f42] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={sortBy}
            onChange={(event) =>
              handleSortChange(
                event.target.value as SortBy
              )
            }
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 outline-none focus:border-[#002B5B]"
          >
            <option value="outstanding">
              Sort: Outstanding
            </option>

            <option value="payableCreated">
              Sort: Payable Created
            </option>

            <option value="settled">
              Sort: Settled
            </option>

            <option value="lastActivity">
              Sort: Last Activity
            </option>
          </select>

          <button
            type="button"
            onClick={
              handleSortOrder
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-gray-600 transition hover:border-[#002B5B]"
            title={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
          >
            {sortOrder ===
            "desc" ? (
              <ArrowDown
                size={14}
              />
            ) : (
              <ArrowUp
                size={14}
              />
            )}

            {sortOrder ===
            "desc"
              ? "Desc"
              : "Asc"}
          </button>

          <select
            value={limit}
            onChange={
              handleLimitChange
            }
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 outline-none focus:border-[#002B5B]"
          >
            <option value={25}>
              25 / page
            </option>

            <option value={50}>
              50 / page
            </option>

            <option value={100}>
              100 / page
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#002B5B]">
                Vendor Balances
              </h3>

              <p className="mt-1 text-xs font-medium text-gray-400">
                Account{" "}
                {data?.vendorPayables
                  .accountCode ??
                  "2000"}{" "}
                â€”{" "}
                {data?.vendorPayables
                  .accountName ??
                  "Vendor Payable"}
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
              {summary?.vendorCount ??
                0}{" "}
              {summary?.vendorCount ===
              1
                ? "Vendor"
                : "Vendors"}
            </span>
          </div>
        </div>

        {loading && !data ? (
          <div className="px-5 py-12 text-center">
            <RefreshCw
              size={22}
              className="mx-auto animate-spin text-gray-300"
            />

            <p className="mt-3 text-xs font-bold text-gray-400">
              Loading vendor payables...
            </p>
          </div>
        ) : vendors.length ===
          0 ? (
          <div className="px-5 py-12 text-center">
            <Building2
              size={28}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-black text-gray-500">
              No vendor payables found.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {search
                ? "No vendors matched your search."
                : "Posted vendor payable ledger entries will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Vendor
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Payable Created
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Settled
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Outstanding
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Last Activity
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vendors.map(
                    (vendor) => (
                      <tr
                        key={
                          vendor.vendorProfileId
                        }
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-black text-[#002B5B]">
                              {vendor.vendor
                                ?.storeName ??
                                "Unknown Vendor"}
                            </p>

                            <p className="mt-1 text-xs font-medium text-gray-400">
                              {vendor.vendor
                                ?.name ??
                                "â€”"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-bold text-gray-700">
                          {formatNaira(
                            vendor.totalPayableCreated
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-bold text-gray-700">
                          {formatNaira(
                            vendor.totalSettled
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-[#002B5B]">
                            {formatNaira(
                              vendor.outstandingPayable
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right text-xs font-semibold text-gray-400">
                          {formatDate(
                            vendor.lastActivityAt
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {vendors.map(
                (vendor) => (
                  <div
                    key={
                      vendor.vendorProfileId
                    }
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-[#002B5B]">
                          {vendor.vendor
                            ?.storeName ??
                            "Unknown Vendor"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {vendor.vendor
                            ?.name ??
                            "â€”"}
                        </p>
                      </div>

                      <span className="text-sm font-black text-[#002B5B]">
                        {formatNaira(
                          vendor.outstandingPayable
                        )}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                          Created
                        </p>

                        <p className="mt-1 text-xs font-bold text-gray-700">
                          {formatNaira(
                            vendor.totalPayableCreated
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                          Settled
                        </p>

                        <p className="mt-1 text-xs font-bold text-gray-700">
                          {formatNaira(
                            vendor.totalSettled
                          )}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                          Last Activity
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-400">
                          {formatDate(
                            vendor.lastActivityAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {pagination &&
              pagination.totalPages >
                0 && (
                <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-gray-400">
                    Showing{" "}
                    <span className="font-black text-gray-600">
                      {pageStart}
                    </span>{" "}
                    to{" "}
                    <span className="font-black text-gray-600">
                      {pageEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-gray-600">
                      {pagination.total}
                    </span>{" "}
                    matching vendors
                  </p>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={
                        loading ||
                        !canGoPrevious
                      }
                      onClick={() =>
                        handlePageChange(
                          pagination.page -
                            1
                        )
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-gray-600 transition hover:border-[#002B5B] hover:text-[#002B5B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={14}
                      />
                      Previous
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                      {pageNumbers.map(
                        (pageNumber, index) => {
                          const previous =
                            pageNumbers[
                              index - 1
                            ];

                          const showGap =
                            previous !==
                              undefined &&
                            pageNumber -
                              previous >
                              1;

                          return (
                            <React.Fragment
                              key={
                                pageNumber
                              }
                            >
                              {showGap && (
                                <span className="px-1 text-xs font-bold text-gray-300">
                                  â€¦
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePageChange(
                                    pageNumber
                                  )
                                }
                                disabled={
                                  loading
                                }
                                className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${
                                  pageNumber ===
                                  pagination.page
                                    ? "bg-[#002B5B] text-white"
                                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#002B5B] hover:text-[#002B5B]"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                {
                                  pageNumber
                                }
                              </button>
                            </React.Fragment>
                          );
                        }
                      )}
                    </div>

                    <span className="text-xs font-black text-gray-500 sm:hidden">
                      Page{" "}
                      {
                        pagination.page
                      }{" "}
                      of{" "}
                      {
                        pagination.totalPages
                      }
                    </span>

                    <button
                      type="button"
                      disabled={
                        loading ||
                        !canGoNext
                      }
                      onClick={() =>
                        handlePageChange(
                          pagination.page +
                            1
                        )
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-gray-600 transition hover:border-[#002B5B] hover:text-[#002B5B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </section>
  );
}