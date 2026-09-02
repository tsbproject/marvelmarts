"use client";

import { CalendarDays } from "lucide-react";

export interface SecurityLogFilterOption {
  value: string;
  label: string;
}

export interface SecurityLogFiltersProps {
  eventOptions?: SecurityLogFilterOption[];
  severityOptions?: SecurityLogFilterOption[];
  actionOptions?: SecurityLogFilterOption[];
  methodOptions?: SecurityLogFilterOption[];
  statusOptions?: SecurityLogFilterOption[];
  outcomeOptions?: SecurityLogFilterOption[];

  event?: string;
  severity?: string;
  action?: string;
  method?: string;
  statusCode?: string;
  success?: string;

  dateFrom?: string;
  dateTo?: string;

  onEventChange?: (value: string) => void;
  onSeverityChange?: (value: string) => void;
  onActionChange?: (value: string) => void;
  onMethodChange?: (value: string) => void;
  onStatusCodeChange?: (value: string) => void;
  onSuccessChange?: (value: string) => void;

  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
}

function SelectFilter({
  label,
  value = "",
  options = [],
  onChange,
}: {
  label: string;
  value?: string;
  options?: SecurityLogFilterOption[];
  onChange?: (value: string) => void;
}) {
  if (!onChange) {
    return null;
  }

  return (
    <label className="min-w-0 flex-1">
      <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          w-full
          rounded-xl
          border border-gray-100
          bg-gray-50
          px-3
          py-3
          text-xs
          font-bold
          text-accent-navy
          outline-none
          transition
          focus:border-indigo-100
          focus:ring-2
          focus:ring-indigo-50
        "
      >
        <option value="">All</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SecurityLogFilters({
  eventOptions = [],
  severityOptions = [],
  actionOptions = [],
  methodOptions = [],
  statusOptions = [],
  event = "",
  severity = "",
  action = "",
  method = "",
  statusCode = "",
  success = "",
  dateFrom = "",
  dateTo = "",
  onEventChange,
  onSeverityChange,
  onActionChange,
  onMethodChange,
  onStatusCodeChange,
  onSuccessChange,
  onDateFromChange,
  onDateToChange,
}: SecurityLogFiltersProps) {
  const hasSelectFilters =
    !!onEventChange ||
    !!onSeverityChange ||
    !!onActionChange ||
    !!onMethodChange ||
    !!onStatusCodeChange ||
    !!onSuccessChange;

  const hasDateFilters =
    !!onDateFromChange ||
    !!onDateToChange;

  if (!hasSelectFilters && !hasDateFilters) {
    return null;
  }

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
        <CalendarDays size={14} />
        Refine Results
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectFilter
          label="Event"
          value={event}
          options={eventOptions}
          onChange={onEventChange}
        />

        <SelectFilter
          label="Severity"
          value={severity}
          options={severityOptions}
          onChange={onSeverityChange}
        />

        <SelectFilter
          label="Action"
          value={action}
          options={actionOptions}
          onChange={onActionChange}
        />

        <SelectFilter
          label="Method"
          value={method}
          options={methodOptions}
          onChange={onMethodChange}
        />

        <SelectFilter
          label="Status"
          value={statusCode}
          options={statusOptions}
          onChange={onStatusCodeChange}
        />

        <SelectFilter
          label="Authentication"
          value={success}
          options={[
            {
              value: "true",
              label: "Successful",
            },
            {
              value: "false",
              label: "Failed",
            },
          ]}
          onChange={onSuccessChange}
        />

        {hasDateFilters && (
          <>
            <label className="min-w-0">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                From
              </span>

              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  onDateFromChange?.(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border border-gray-100
                  bg-gray-50
                  px-3
                  py-3
                  text-xs
                  font-bold
                  text-accent-navy
                  outline-none
                  transition
                  focus:border-indigo-100
                  focus:ring-2
                  focus:ring-indigo-50
                "
              />
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                To
              </span>

              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  onDateToChange?.(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border border-gray-100
                  bg-gray-50
                  px-3
                  py-3
                  text-xs
                  font-bold
                  text-accent-navy
                  outline-none
                  transition
                  focus:border-indigo-100
                  focus:ring-2
                  focus:ring-indigo-50
                "
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}