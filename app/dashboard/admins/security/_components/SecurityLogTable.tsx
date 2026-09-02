"use client";

import {
  Eye,
  SearchX,
} from "lucide-react";

import type {
  SecurityLogColumn,
} from "./security-log-types";

interface SecurityLogTableProps {
  columns: SecurityLogColumn[];
  rows: Record<string, unknown>[];

  loading?: boolean;
  emptyMessage?: string;

  onView: (row: Record<string, unknown>) => void;
}

export default function SecurityLogTable({
  columns,
  rows,
  loading = false,
  emptyMessage = "No security records found.",
  onView,
}: SecurityLogTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#F8F8F8]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.18em] text-gray-400"
                  >
                    {column.label}
                  </th>
                ))}

                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {Array.from(
                { length: 6 },
                (_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-8 py-5"
                      >
                        <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    ))}

                    <td className="px-8 py-5">
                      <div className="ml-auto h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
          <SearchX size={24} />
        </div>

        <h3 className="mt-4 text-sm font-black uppercase tracking-tight text-accent-navy">
          No Records Found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#F8F8F8]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"
                >
                  {column.label}
                </th>
              ))}

              <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rows.map((row, rowIndex) => (
              <tr
                key={
                  typeof row.id === "string"
                    ? row.id
                    : rowIndex
                }
                className="transition-colors hover:bg-gray-50/70"
              >
                {columns.map((column) => {
                  const value =
                    row[column.key];

                  return (
                    <td
                      key={column.key}
                      className="px-8 py-5 align-middle"
                    >
                      {column.render
                        ? column.render(
                            value,
                            row
                          )
                        : (
                            <span className="text-xs font-semibold text-gray-600">
                              {value === null ||
                              value === undefined ||
                              value === ""
                                ? "—"
                                : String(value)}
                            </span>
                          )}
                    </td>
                  );
                })}

                <td className="px-8 py-5 text-right">
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-gray-50
                      text-gray-500
                      transition
                      hover:bg-indigo-50
                      hover:text-indigo-600
                    "
                    aria-label="View log details"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}