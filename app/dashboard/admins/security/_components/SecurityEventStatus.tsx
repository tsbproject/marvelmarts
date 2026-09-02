import {
  CheckCircle2,
  CircleAlert,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import type {
  SecurityLogOutcome,
} from "./security-log-types";

interface SecurityEventStatusProps {
  outcome: SecurityLogOutcome | string;
}

export default function SecurityEventStatus({
  outcome,
}: SecurityEventStatusProps) {
  const normalized = outcome.toUpperCase();

  const config =
    normalized === "SUCCESS"
      ? {
          label: "Success",
          icon: CheckCircle2,
          className:
            "bg-green-50 text-green-700 border-green-100",
        }
      : normalized === "FAILED"
        ? {
            label: "Failed",
            icon: CircleAlert,
            className:
              "bg-red-50 text-red-700 border-red-100",
          }
        : normalized === "BLOCKED"
          ? {
              label: "Blocked",
              icon: ShieldAlert,
              className:
                "bg-orange-50 text-orange-700 border-orange-100",
            }
          : {
              label: "Attention",
              icon: TriangleAlert,
              className:
                "bg-amber-50 text-amber-700 border-amber-100",
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