"use client";

import {
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";

interface SecurityLogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  showFilters: boolean;
  onToggleFilters: () => void;

  onClearFilters?: () => void;
  onExport?: () => void;

  exportLabel?: string;
}

export default function SecurityLogToolbar({
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  onExport,
  exportLabel = "Export",
}: SecurityLogToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search security records..."
            className="
              w-full
              rounded-2xl
              border border-transparent
              bg-[#F8F8F8]
              py-3
              pl-11
              pr-4
              text-sm
              font-medium
              text-accent-navy
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-indigo-100
              focus:ring-2
              focus:ring-indigo-50
            "
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFilters}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-3
              text-[10px]
              font-black
              uppercase
              tracking-[0.12em]
              transition
              ${
                showFilters
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            <Filter size={15} />
            Filters
          </button>

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gray-50
                px-4
                py-3
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              <X size={15} />
              Clear
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-accent-navy
                px-4
                py-3
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-white
                shadow-sm
                transition
                hover:bg-brand-primary
                active:scale-[0.98]
              "
            >
              <Download size={15} />
              {exportLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}