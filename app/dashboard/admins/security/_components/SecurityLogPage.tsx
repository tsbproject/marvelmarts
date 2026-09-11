"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import SecurityLogToolbar from "./SecurityLogToolbar";
import SecurityEventDrawer from "./SecurityEventDrawer";
import SecurityLogPagination from "./SecurityLogPagination";
import SecurityLogTable from "./SecurityLogTable";

import SecurityLogFilters, {
  type SecurityLogFilterOption,
} from "./SecurityLogFilters";


import type {
  SecurityLogColumn,
  SecurityLogType,
} from "./security-log-types";

interface SecurityLogPageProps {
  type: SecurityLogType;
  title: string;
  description: string;
  endpoint: string;
  columns: SecurityLogColumn[];
  emptyMessage?: string;
  exportEndpoint?: string;
  exportLabel?: string;
  
  filterOptions?: {
  events?: SecurityLogFilterOption[];
  severities?: SecurityLogFilterOption[];
  actions?: SecurityLogFilterOption[];
  methods?: SecurityLogFilterOption[];
  statusCodes?: SecurityLogFilterOption[];
  
};
}

interface LogResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function buildQuery(params: {
  search: string;
  page: number;
  pageSize: number;
  event: string;
  severity: string;
  action: string;
  method: string;
  statusCode: string;
  success: string;
  dateFrom: string;
  dateTo: string;
}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.event) {
    query.set("event", params.event);
  }

  if (params.severity) {
    query.set("severity", params.severity);
  }

  if (params.action) {
    query.set("action", params.action);
  }

  if (params.method) {
    query.set("method", params.method);
  }

  if (params.statusCode) {
    query.set("statusCode", params.statusCode);
  }

  if (params.success) {
    query.set("success", params.success);
  }

  if (params.dateFrom) {
    query.set("dateFrom", params.dateFrom);
  }

  if (params.dateTo) {
    query.set("dateTo", params.dateTo);
  }

  return query.toString();
}

export default function SecurityLogPage({
  type,
  title,
  description,
  endpoint,
  columns,
  emptyMessage,
  exportEndpoint,
  exportLabel = "Export CSV",
  filterOptions,
}: SecurityLogPageProps) {
  const [rows, setRows] = useState<
    Record<string, unknown>[]
  >([]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [event, setEvent] = useState("");
  const [severity, setSeverity] = useState("");
  const [action, setAction] = useState("");
  const [method, setMethod] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [success, setSuccess] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedRow, setSelectedRow] =
    useState<Record<string, unknown> | null>(
      null
    );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(
    () =>
      buildQuery({
        search: debouncedSearch,
        page,
        pageSize,
        event,
        severity,
        action,
        method,
        statusCode,
        success,
        dateFrom,
        dateTo,
      }),
    [
      debouncedSearch,
      page,
      pageSize,
      event,
      severity,
      action,
      method,
      statusCode,
      success,
      dateFrom,
      dateTo,
    ]
  );

  const loadLogs = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${endpoint}?${queryString}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load ${type} logs.`
          );
        }

        const data =
          (await response.json()) as LogResponse;

        setRows(
          Array.isArray(data.items)
            ? data.items
            : []
        );

        setTotal(
          typeof data.total === "number"
            ? data.total
            : 0
        );

        setTotalPages(
          typeof data.totalPages === "number"
            ? data.totalPages
            : 0
        );
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          `Failed to load ${type} logs`,
          err
        );

        setRows([]);
        setTotal(0);
        setTotalPages(0);
        setError(
          `Unable to load ${type} logs. Please try again.`
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [endpoint, queryString, type]
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadLogs(controller.signal);

    return () => controller.abort();
  }, [loadLogs]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setEvent("");
    setSeverity("");
    setAction("");
    setMethod("");
    setStatusCode("");
    setSuccess("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleExport = () => {
    if (!exportEndpoint) {
      return;
    }

    const query = buildQuery({
      search: debouncedSearch,
      page: 1,
      pageSize: 1,
      event,
      severity,
      action,
      method,
      statusCode,
      success,
      dateFrom,
      dateTo,
    });

    window.open(
      `${exportEndpoint}?${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const hasActiveFilters =
    Boolean(event) ||
    Boolean(severity) ||
    Boolean(action) ||
    Boolean(method) ||
    Boolean(statusCode) ||
    Boolean(success) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
          Security Administration
        </p>

        <h1 className="mt-1 text-xl font-black uppercase tracking-tight text-accent-navy sm:text-2xl">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      {/* Toolbar */}
      <SecurityLogToolbar
        search={search}
        onSearchChange={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={() =>
          setShowFilters((value) => !value)
        }
        onClearFilters={
          hasActiveFilters
            ? clearFilters
            : undefined
        }
        onExport={
          exportEndpoint
            ? handleExport
            : undefined
        }
        exportLabel={exportLabel}
      />

            {/* Filters */}
      {showFilters && (
        <SecurityLogFilters
          event={type === "security" ? event : undefined}
          onEventChange={
            type === "security"
              ? (value) => {
                  setEvent(value);
                  resetToFirstPage();
                }
              : undefined
          }

          severity={
            type === "security"
              ? severity
              : undefined
          }
          onSeverityChange={
            type === "security"
              ? (value) => {
                  setSeverity(value);
                  resetToFirstPage();
                }
              : undefined
          }

          action={
            type === "audit" || type === "auth"
              ? action
              : undefined
          }
          onActionChange={
            type === "audit" || type === "auth"
              ? (value) => {
                  setAction(value);
                  resetToFirstPage();
                }
              : undefined
          }

          method={
            type === "api"
              ? method
              : undefined
          }
          onMethodChange={
            type === "api"
              ? (value) => {
                  setMethod(value);
                  resetToFirstPage();
                }
              : undefined
          }

          statusCode={
            type === "api"
              ? statusCode
              : undefined
          }
          onStatusCodeChange={
            type === "api"
              ? (value) => {
                  setStatusCode(value);
                  resetToFirstPage();
                }
              : undefined
          }

          success={
            type === "auth"
              ? success
              : undefined
          }
          onSuccessChange={
            type === "auth"
              ? (value) => {
                  setSuccess(value);
                  resetToFirstPage();
                }
              : undefined
          }
        />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="text-xs font-black uppercase tracking-tight">
              Unable to Load Records
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <SecurityLogTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage={emptyMessage}
        onView={setSelectedRow}
      />

      {/* Pagination */}
      <SecurityLogPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Details */}
      <SecurityEventDrawer
        open={selectedRow !== null}
        type={type}
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}