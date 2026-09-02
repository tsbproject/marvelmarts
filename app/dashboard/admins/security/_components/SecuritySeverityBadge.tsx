import {
  AlertTriangle,
  CircleAlert,
  Info,
  ShieldAlert,
} from "lucide-react";

import type {
  SecurityLogSeverity,
} from "./security-log-types";

interface SecuritySeverityBadgeProps {
  severity?: SecurityLogSeverity | string | null;
}

export default function SecuritySeverityBadge({
  severity,
}: SecuritySeverityBadgeProps) {
  const normalized =
    severity?.toUpperCase() ?? "INFO";

  const config =
    normalized === "CRITICAL"
      ? {
          label: "Critical",
          icon: ShieldAlert,
          className:
            "bg-red-50 text-red-700 border-red-100",
        }
      : normalized === "ERROR"
        ? {
            label: "Error",
            icon: CircleAlert,
            className:
              "bg-orange-50 text-orange-700 border-orange-100",
          }
        : normalized === "WARNING"
          ? {
              label: "Warning",
              icon: AlertTriangle,
              className:
                "bg-amber-50 text-amber-700 border-amber-100",
            }
          : {
              label: "Info",
              icon: Info,
              className:
                "bg-gray-50 text-gray-600 border-gray-100",
            };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}