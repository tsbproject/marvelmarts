"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Copy,
  Globe2,
  Hash,
  Info,
  LockKeyhole,
  MapPin,
  Server,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import SecuritySeverityBadge from "./SecuritySeverityBadge";
import SecurityEventStatus from "./SecurityEventStatus";
import type {
  SecurityLogOutcome,
  SecurityLogType,
} from "./security-log-types";

interface SecurityEventDrawerProps {
  open: boolean;
  type: SecurityLogType;
  row: Record<string, unknown> | null;
  onClose: () => void;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getOutcome(
  type: SecurityLogType,
  row: Record<string, unknown>
): SecurityLogOutcome {
  if (type === "auth") {
    return row.success === true
      ? "SUCCESS"
      : "FAILED";
  }

  if (type === "api") {
    const statusCode =
      typeof row.statusCode === "number"
        ? row.statusCode
        : Number(row.statusCode);

    if (statusCode >= 200 && statusCode < 400) {
      return "SUCCESS";
    }

    if (
      statusCode === 401 ||
      statusCode === 403
    ) {
      return "BLOCKED";
    }

    if (statusCode >= 400) {
      return "FAILED";
    }

    return "ATTENTION";
  }

  if (type === "security") {
    const event = String(
      row.event ?? ""
    ).toUpperCase();

    switch (event) {
      case "CSRF_BLOCKED":
      case "RATE_LIMIT_EXCEEDED":
      case "PERMISSION_DENIED":
      case "REPLAY_ATTACK":
        return "BLOCKED";

      case "INVALID_TOKEN":
      case "INVALID_PAYMENT":
      case "WEBHOOK_SIGNATURE_FAILED":
        return "FAILED";

      case "SUSPICIOUS_ACTIVITY":
        return "ATTENTION";

      default:
        return "ATTENTION";
    }
  }

  return "SUCCESS";
}

function formatTimestamp(value: unknown): string {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return displayValue(value);
  }

  return date.toLocaleString();
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-xs font-semibold text-accent-navy">
        {displayValue(value)}
      </p>
    </div>
  );
}

export default function SecurityEventDrawer({
  open,
  type,
  row,
  onClose,
}: SecurityEventDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !row) {
    return null;
  }

  const severity =
    typeof row.severity === "string"
      ? row.severity
      : "INFO";

  const outcome = getOutcome(type, row);

  const eventTitle =
    type === "audit"
      ? "Audit Event"
      : type === "security"
        ? "Security Event"
        : type === "api"
          ? "API Request"
          : "Authentication Event";

  const eventIdentifier =
    typeof row.id === "string"
      ? row.id
      : "—";

  const requestId =
    typeof row.requestId === "string"
      ? row.requestId
      : null;

  const copyRequestId = async () => {
    if (!requestId) return;

    try {
      await navigator.clipboard.writeText(
        requestId
      );
      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${eventTitle} details`}
    >
      <button
        type="button"
        aria-label="Close log details"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldAlert size={19} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Security Administration
                </p>

                <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-accent-navy">
                  {eventTitle}
                </h2>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Status */}
          <div className="rounded-3xl border border-gray-100 bg-[#F8F8F8] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Event Status
                </p>

                <div className="mt-2">
                  <SecurityEventStatus outcome={outcome} />
                </div>
              </div>

              {type !== "audit" && (
                <div>
                  <p className="mb-2 text-right text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                    Severity
                  </p>

                  <SecuritySeverityBadge
                    severity={String(row.severity ?? "INFO")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Core information */}
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Info
                size={15}
                className="text-indigo-600"
              />

              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-navy">
                Event Information
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={<Hash size={12} />}
                label="Event ID"
                value={eventIdentifier}
              />

              <DetailRow
                icon={<CalendarDays size={12} />}
                label="Timestamp"
                value={formatTimestamp(
                  row.createdAt
                )}
              />

              {type === "audit" && (
                <>
                  <DetailRow
                    icon={<LockKeyhole size={12} />}
                    label="Action"
                    value={row.action}
                  />

                  <DetailRow
                    icon={<Server size={12} />}
                    label="Entity"
                    value={row.entity}
                  />

                  <DetailRow
                    icon={<Hash size={12} />}
                    label="Entity ID"
                    value={row.entityId}
                  />

                  <DetailRow
                    icon={<Server size={12} />}
                    label="Request Path"
                    value={row.requestPath}
                  />

                  <DetailRow
                    icon={<Globe2 size={12} />}
                    label="Method"
                    value={row.requestMethod}
                  />
                </>
              )}

              {type === "security" && (
                <>
                  <DetailRow
                    icon={<ShieldAlert size={12} />}
                    label="Event"
                    value={row.event}
                  />

                  <DetailRow
                    icon={<Server size={12} />}
                    label="Request Path"
                    value={row.requestPath}
                  />

                  <DetailRow
                    icon={<Globe2 size={12} />}
                    label="Method"
                    value={row.requestMethod}
                  />
                </>
              )}

              {type === "api" && (
                <>
                  <DetailRow
                    icon={<Globe2 size={12} />}
                    label="Method"
                    value={row.method}
                  />

                  <DetailRow
                    icon={<Server size={12} />}
                    label="Path"
                    value={row.path}
                  />

                  <DetailRow
                    icon={<AlertTriangle size={12} />}
                    label="Status Code"
                    value={row.statusCode}
                  />

                  <DetailRow
                    icon={<CalendarDays size={12} />}
                    label="Duration"
                    value={
                      row.durationMs !==
                      undefined
                        ? `${displayValue(
                            row.durationMs
                          )} ms`
                        : "—"
                    }
                  />
                </>
              )}

              {type === "auth" && (
                <>
                  <DetailRow
                    icon={<LockKeyhole size={12} />}
                    label="Action"
                    value={row.action}
                  />

                  <DetailRow
                    icon={<CheckCircle2 size={12} />}
                    label="Success"
                    value={row.success}
                  />

                  <DetailRow
                    icon={<UserRound size={12} />}
                    label="Email"
                    value={row.email}
                  />
                </>
              )}
            </div>
          </section>

          {/* Actor / user */}
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <UserRound
                size={15}
                className="text-indigo-600"
              />

              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-navy">
                Actor & Request
              </h3>
            </div>

            {(() => {
          const actor =
            typeof row.actor === "object" &&
            row.actor !== null
              ? (row.actor as Record<string, unknown>)
              : undefined;

          const user =
            typeof row.user === "object" &&
            row.user !== null
              ? (row.user as Record<string, unknown>)
              : undefined;

          const newValues =
            typeof row.newValues === "object" &&
            row.newValues !== null
              ? (row.newValues as Record<string, unknown>)
              : undefined;

          const actorType =
            typeof newValues?.actorType === "string"
              ? newValues.actorType
              : undefined;

          const paymentSource =
            typeof newValues?.paymentSource === "string"
              ? newValues.paymentSource
              : undefined;

          const isSystemActor =
            actorType === "SYSTEM";

          const actorId =
            row.userId ??
            row.actorId;

          const actorName =
            typeof user?.name === "string"
              ? user.name
              : typeof user?.email === "string"
                ? user.email
                : typeof actor?.name === "string"
                  ? actor.name
                  : typeof actor?.email === "string"
                    ? actor.email
                    : undefined;

          const actorRole =
            row.actorRole ??
            (typeof actor?.role === "string"
              ? actor.role
              : undefined);

          return (
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={<UserRound size={12} />}
                label="Actor ID"
                value={
                  isSystemActor
                    ? "SYSTEM"
                    : actorId
                }
              />

              <DetailRow
                icon={<UserRound size={12} />}
                label="Actor"
                value={
                  isSystemActor
                    ? paymentSource
                      ? `System / ${paymentSource}`
                      : "System"
                    : actorName
                }
              />

              {type === "audit" && (
                <DetailRow
                  icon={<ShieldAlert size={12} />}
                  label="Role"
                  value={
                    isSystemActor
                      ? "SYSTEM"
                      : actorRole
                  }
                />
              )}

              <DetailRow
                icon={<MapPin size={12} />}
                label="IP Address"
                value={row.ipAddress}
              />

              <DetailRow
                icon={<Globe2 size={12} />}
                label="User Agent"
                value={row.userAgent}
              />
            </div>
          );
        })()}
          </section>

          {/* Request ID */}
          {requestId && (
            <section className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Hash
                  size={15}
                  className="text-indigo-600"
                />

                <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-navy">
                  Request ID
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <code className="min-w-0 flex-1 break-all text-[11px] font-semibold text-gray-600">
                  {requestId}
                </code>

                <button
                  type="button"
                  onClick={copyRequestId}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 text-[9px] font-black uppercase tracking-wider text-gray-500 shadow-sm transition hover:text-indigo-600"
                >
                  <Copy size={13} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          )}

          {/* Structured payload */}
          {(type === "audit" ||
            type === "security") &&
            (row.oldValues !== undefined ||
              row.newValues !== undefined ||
              row.metadata !== undefined) && (
              <section className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <Server
                    size={15}
                    className="text-indigo-600"
                  />

                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-navy">
                    Structured Details
                  </h3>
                </div>

                <div className="space-y-3">
                  {row.oldValues !==
                    undefined && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                        Previous Values
                      </p>

                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-gray-600">
                        {displayValue(
                          row.oldValues
                        )}
                      </pre>
                    </div>
                  )}

                  {row.newValues !==
                    undefined && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                        New Values
                      </p>

                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-gray-600">
                        {displayValue(
                          row.newValues
                        )}
                      </pre>
                    </div>
                  )}

                  {row.metadata !==
                    undefined && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                        Metadata
                      </p>

                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-gray-600">
                        {displayValue(
                          row.metadata
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </section>
            )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-[#F8F8F8] px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-accent-navy px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-black active:scale-[0.99]"
          >
            Close Details
          </button>
        </div>
      </aside>
    </div>
  );
}