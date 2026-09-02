"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SecurityLogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getPageItems(
  page: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (page <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      totalPages,
    ];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    page - 1,
    page,
    page + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function SecurityLogPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: SecurityLogPaginationProps) {
  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const start =
    (page - 1) * pageSize + 1;

  const end = Math.min(
    page * pageSize,
    total
  );

  const pageItems = getPageItems(
    page,
    totalPages
  );

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
        Showing{" "}
        <span className="text-accent-navy">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="text-accent-navy">
          {total}
        </span>{" "}
        records
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            text-gray-500
            transition
            hover:bg-gray-100
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex items-center gap-1">
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-[10px] font-black text-gray-400"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`
                  h-9
                  min-w-9
                  rounded-xl
                  px-2
                  text-[10px]
                  font-black
                  transition
                  ${
                    item === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-accent-navy"
                  }
                `}
                aria-current={
                  item === page
                    ? "page"
                    : undefined
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-gray-100
            bg-gray-50
            text-gray-500
            transition
            hover:bg-gray-100
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}