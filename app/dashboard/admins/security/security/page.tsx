'use client'

import SecurityLogPage from "../_components/SecurityLogPage";
import SecuritySeverityBadge from "../_components/SecuritySeverityBadge";
import type {
  SecurityLogColumn,
} from "../_components/security-log-types";
import SecurityBackButton from "../_components/SecurityBackButton";

const columns: SecurityLogColumn[] = [
  {
    key: "createdAt",
    label: "Timestamp",
    render: (value) => {
      if (!value) {
        return (
          <span className="text-xs font-semibold text-gray-400">
            —
          </span>
        );
      }

      const date = new Date(String(value));

      if (Number.isNaN(date.getTime())) {
        return (
          <span className="text-xs font-semibold text-gray-500">
            {String(value)}
          </span>
        );
      }

      return (
        <div>
          <p className="text-xs font-bold text-accent-navy">
            {date.toLocaleDateString()}
          </p>

          <p className="mt-1 text-[10px] font-semibold text-gray-400">
            {date.toLocaleTimeString()}
          </p>
        </div>
      );
    },
  },

  {
    key: "event",
    label: "Event",
    render: (value) => (
      <span className="text-xs font-bold text-gray-700">
        {value ? String(value) : "—"}
      </span>
    ),
  },

  {
    key: "severity",
    label: "Severity",
    render: (value) => (
      <SecuritySeverityBadge
        severity={
          typeof value === "string"
            ? value
            : "INFO"
        }
      />
    ),
  },

  {
    key: "user",
    label: "User",
    render: (_value, rawRow) => {
      if (
        typeof rawRow !== "object" ||
        rawRow === null
      ) {
        return (
          <span className="text-xs font-semibold text-gray-400">
            System
          </span>
        );
      }

      const row =
        rawRow as Record<string, unknown>;

      const user =
        typeof row.user === "object" &&
        row.user !== null
          ? (row.user as Record<
              string,
              unknown
            >)
          : null;

      const name =
        typeof user?.name === "string"
          ? user.name
          : null;

      const email =
        typeof user?.email === "string"
          ? user.email
          : null;

      return (
        <div>
          <p className="text-xs font-bold text-accent-navy">
            {name ?? email ?? "System"}
          </p>

          {name && email && (
            <p className="mt-1 max-w-[180px] truncate text-[10px] text-gray-400">
              {email}
            </p>
          )}
        </div>
      );
    },
  },

  {
    key: "requestPath",
    label: "Request",
    render: (_value, rawRow) => {
      if (
        typeof rawRow !== "object" ||
        rawRow === null
      ) {
        return (
          <span className="text-xs text-gray-400">
            —
          </span>
        );
      }

      const row =
        rawRow as Record<string, unknown>;

      const path =
        typeof row.requestPath === "string"
          ? row.requestPath
          : "—";

      const method =
        typeof row.requestMethod === "string"
          ? row.requestMethod
          : "";

      return (
        <div>
          {method && (
            <span className="mr-2 inline-flex rounded-lg bg-gray-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-gray-500">
              {method}
            </span>
          )}

          <span className="font-mono text-[10px] font-semibold text-gray-600">
            {path}
          </span>
        </div>
      );
    },
  },

  {
    key: "ipAddress",
    label: "IP Address",
    render: (value) => (
      <span className="font-mono text-[10px] font-semibold text-gray-500">
        {value ? String(value) : "—"}
      </span>
    ),
  },
];

const eventOptions = [
  {
    value: "CSRF_BLOCKED",
    label: "CSRF Blocked",
  },
  {
    value: "RATE_LIMIT_EXCEEDED",
    label: "Rate Limit Exceeded",
  },
  {
    value: "INVALID_TOKEN",
    label: "Invalid Token",
  },
  {
    value: "PERMISSION_DENIED",
    label: "Permission Denied",
  },
  {
    value: "INVALID_PAYMENT",
    label: "Invalid Payment",
  },
  {
    value: "WEBHOOK_SIGNATURE_FAILED",
    label: "Webhook Signature Failed",
  },
  {
    value: "REPLAY_ATTACK",
    label: "Replay Attack",
  },
  {
    value: "SUSPICIOUS_ACTIVITY",
    label: "Suspicious Activity",
  },
];

const severityOptions = [
  {
    value: "INFO",
    label: "Info",
  },
  {
    value: "WARNING",
    label: "Warning",
  },
  {
    value: "ERROR",
    label: "Error",
  },
  {
    value: "CRITICAL",
    label: "Critical",
  },
];

const methodOptions = [
  {
    value: "GET",
    label: "GET",
  },
  {
    value: "POST",
    label: "POST",
  },
  {
    value: "PUT",
    label: "PUT",
  },
  {
    value: "PATCH",
    label: "PATCH",
  },
  {
    value: "DELETE",
    label: "DELETE",
  },
];


export default function SecurityLogsPage() {
  return (

      <div className="space-y-5">
    <SecurityBackButton />
   

    <SecurityLogPage
      type="security"
      title="Security Logs"
      description="Monitor security events, suspicious activity, access violations, and other security signals recorded across MarvelMarts."
      endpoint="/api/admins/security/security-logs"
      exportEndpoint="/api/admins/security/security-logs/export"
      exportLabel="Export Security CSV"
      columns={columns}
      emptyMessage="No security events match the current search or filters."
      filterOptions={{
        events: eventOptions,
        severities: severityOptions,
        methods: methodOptions,
      }}
    />
    </div>

    
  );
}