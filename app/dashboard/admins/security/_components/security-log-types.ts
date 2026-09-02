export type SecurityLogType =
  | "audit"
  | "security"
  | "api"
  | "auth";

export type SecurityLogSeverity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export type SecurityLogOutcome =
  | "SUCCESS"
  | "ATTENTION"
  | "FAILED"
  | "BLOCKED";

export interface SecurityLogColumn<T = unknown> {
  key: string;
  label: string;
  render?: (value: T, row: unknown) => React.ReactNode;
}

export interface SecurityLogTableConfig {
  type: SecurityLogType;
  title: string;
  description: string;
  columns: SecurityLogColumn[];
  detailLabel: string;
}