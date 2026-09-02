"use client";


"use client";

import SecurityLogPage from "../_components/SecurityLogPage";
import SecuritySeverityBadge from "../_components/SecuritySeverityBadge";
import SecurityEventStatus from "../_components/SecurityEventStatus";
import SecurityBackButton from "../_components/SecurityBackButton";
import type {
  SecurityLogColumn,
} from "../_components/security-log-types";

const apiColumns: SecurityLogColumn[] = [
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
    key: "method",
    label: "Method",
    render: (value) => (
      <span className="inline-flex rounded-lg bg-gray-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-gray-600">
        {value ? String(value) : "—"}
      </span>
    ),
  },

  {
    key: "path",
    label: "Path",
    render: (value) => (
      <span className="font-mono text-[10px] font-semibold text-gray-600">
        {value ? String(value) : "—"}
      </span>
    ),
  },

  {
    key: "statusCode",
    label: "Status",
    render: (value) => {
      const status =
        typeof value === "number"
          ? value
          : Number(value);

      if (!Number.isFinite(status)) {
        return (
          <span className="text-xs font-semibold text-gray-400">
            —
          </span>
        );
      }

      let className =
        "bg-gray-100 text-gray-600";

      if (status >= 200 && status < 300) {
        className =
          "bg-emerald-50 text-emerald-700";
      } else if (status >= 300 && status < 400) {
        className =
          "bg-amber-50 text-amber-700";
      } else if (status >= 400 && status < 500) {
        className =
          "bg-orange-50 text-orange-700";
      } else if (status >= 500) {
        className =
          "bg-red-50 text-red-700";
      }

      return (
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-[9px] font-black ${className}`}
        >
          {status}
        </span>
      );
    },
  },

  {
    key: "durationMs",
    label: "Duration",
    render: (value) => {
      const duration =
        typeof value === "number"
          ? value
          : Number(value);

      if (!Number.isFinite(duration)) {
        return (
          <span className="text-xs font-semibold text-gray-400">
            —
          </span>
        );
      }

      return (
        <span className="font-mono text-[10px] font-semibold text-gray-500">
          {duration} ms
        </span>
      );
    },
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
          ? (row.user as Record<string, unknown>)
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
    key: "ipAddress",
    label: "IP Address",
    render: (value) => (
      <span className="font-mono text-[10px] font-semibold text-gray-500">
        {value ? String(value) : "—"}
      </span>
    ),
  },
];

const authColumns: SecurityLogColumn[] = [
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
    key: "action",
    label: "Action",
    render: (value) => (
      <span className="text-xs font-bold text-gray-700">
        {value ? String(value) : "—"}
      </span>
    ),
  },

  {
    key: "success",
    label: "Result",
    render: (value) => (
      <SecurityEventStatus
        outcome={
          value === true || value === "true"
            ? "SUCCESS"
            : "FAILED"
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
          ? (row.user as Record<string, unknown>)
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
    key: "email",
    label: "Email",
    render: (value) => (
      <span className="max-w-[220px] truncate text-[10px] font-semibold text-gray-500">
        {value ? String(value) : "—"}
      </span>
    ),
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

const authActionOptions = [
  {
    value: "LOGIN_SUCCESS",
    label: "Login Success",
  },
  {
    value: "LOGIN_FAILED",
    label: "Login Failed",
  },
  {
    value: "LOGOUT",
    label: "Logout",
  },
  {
    value: "PASSWORD_CHANGED",
    label: "Password Changed",
  },
  {
    value: "PASSWORD_RESET_REQUESTED",
    label: "Password Reset Requested",
  },
  {
    value: "PASSWORD_RESET_COMPLETED",
    label: "Password Reset Completed",
  },
  {
    value: "CUSTOMER_REGISTERED",
    label: "Customer Registered",
  },
  {
    value: "VENDOR_REGISTERED",
    label: "Vendor Registered",
  },
  {
    value: "CUSTOMER_VERIFIED",
    label: "Customer Verified",
  },
  {
    value: "VENDOR_VERIFIED",
    label: "Vendor Verified",
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

const statusCodeOptions = [
  {
    value: "200",
    label: "200 — OK",
  },
  {
    value: "201",
    label: "201 — Created",
  },
  {
    value: "400",
    label: "400 — Bad Request",
  },
  {
    value: "401",
    label: "401 — Unauthorized",
  },
  {
    value: "403",
    label: "403 — Forbidden",
  },
  {
    value: "404",
    label: "404 — Not Found",
  },
  {
    value: "429",
    label: "429 — Rate Limited",
  },
  {
    value: "500",
    label: "500 — Server Error",
  },
];

export default function ApiAuthLogsPage() {
  return (
   
    <div className="space-y-8">
         <SecurityBackButton />
      <SecurityLogPage
        type="api"
        title="API Logs"
        description="Monitor API requests, response status, execution time, users, and request activity across MarvelMarts."
        endpoint="/api/admins/security/api-logs"
        exportEndpoint="/api/admins/security/api-logs/export"
        exportLabel="Export API CSV"
        columns={apiColumns}
        emptyMessage="No API requests match the current search or filters."
        filterOptions={{
          methods: methodOptions,
          statusCodes: statusCodeOptions,
        }}
      />

      <SecurityLogPage
        type="auth"
        title="Authentication Logs"
        description="Review authentication activity, account access events, password operations, registrations, and verification events."
        endpoint="/api/admins/security/auth-logs"
        exportEndpoint="/api/admins/security/auth-logs/export"
        exportLabel="Export Auth CSV"
        columns={authColumns}
        emptyMessage="No authentication events match the current search or filters."
        filterOptions={{
          actions: authActionOptions,
        }}
      />
    </div>
  );
}