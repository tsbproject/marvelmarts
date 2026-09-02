'use client'


import SecurityLogPage from "../_components/SecurityLogPage";
import type {
  SecurityLogColumn,
} from "../_components/security-log-types";
import SecurityBackButton from "../_components/SecurityBackButton";


const columns: SecurityLogColumn[] = [
  {
    key: "createdAt",
    label: "Timestamp",
    render: (value) => (
      <div>
        <p className="text-xs font-bold text-accent-navy">
          {value
            ? new Date(String(value)).toLocaleDateString()
            : "—"}
        </p>

        <p className="mt-1 text-[10px] font-semibold text-gray-400">
          {value
            ? new Date(String(value)).toLocaleTimeString()
            : ""}
        </p>
      </div>
    ),
  },
  {
    key: "actor",
    label: "Actor",
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

    const actor =
        typeof row.actor === "object" &&
        row.actor !== null
        ? row.actor
        : null;

    const actorRecord =
        actor as Record<string, unknown> | null;

    const name =
        typeof actorRecord?.name === "string"
        ? actorRecord.name
        : null;

    const email =
        typeof actorRecord?.email === "string"
        ? actorRecord.email
        : null;

    return (
        <div>
        <p className="text-xs font-bold text-accent-navy">
            {name ?? email ?? "System"}
        </p>

        {email && name && (
            <p className="mt-1 text-[10px] text-gray-400">
            {email}
            </p>
        )}
        </div>
    );
    },
    },
  {
    key: "actorRole",
    label: "Role",
    render: (value) => (
      <span className="inline-flex rounded-xl bg-indigo-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-600">
        {value ? String(value) : "—"}
      </span>
    ),
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
  key: "entity",
  label: "Resource",
  render: (_value, rawRow) => {
    if (
      typeof rawRow !== "object" ||
      rawRow === null
    ) {
      return (
        <span className="text-xs font-semibold text-gray-400">
          —
        </span>
      );
    }

    const row =
      rawRow as Record<string, unknown>;

    const entity =
      typeof row.entity === "string"
        ? row.entity
        : row.entity !== null &&
            row.entity !== undefined
          ? String(row.entity)
          : "—";

    const entityId =
      typeof row.entityId === "string"
        ? row.entityId
        : row.entityId !== null &&
            row.entityId !== undefined
          ? String(row.entityId)
          : "";

    return (
      <div>
        <p className="text-xs font-bold text-gray-700">
          {entity}
        </p>

        {entityId && (
          <p className="mt-1 max-w-[180px] truncate font-mono text-[9px] text-gray-400">
            {entityId}
          </p>
        )}
      </div>
    );
  },
},
  
];

export default function AuditLogsPage() {
  return (

    <div className="space-y-5">
    <SecurityBackButton />


    <SecurityLogPage
      type="audit"
      title="Audit Logs"
      description="Review administrative actions and important marketplace changes recorded across MarvelMarts."
      endpoint="/api/admins/security/audit-logs"
      exportEndpoint="/api/admins/security/audit-logs/export"
      exportLabel="Export Audit CSV"
      columns={columns}
      emptyMessage="No audit events match the current search or filters."
    />
    </div>
  );
}