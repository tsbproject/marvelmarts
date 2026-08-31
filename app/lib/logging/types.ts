import {
  AuditAction,
  AuthAction,
  SecurityEvent,
} from "./actions";

import { SecuritySeverity } from "./severity";

import { Prisma, Role } from "@prisma/client";

export interface AuditLogInput {
  requestId?: string;

  actorId?: string;

  actorRole?: Role;

  action: AuditAction;

  entity: string;

  entityId?: string;

  oldValues?: Prisma.InputJsonValue;

  newValues?: Prisma.InputJsonValue;

  ipAddress?: string;

  userAgent?: string;
}

export interface AuthLogInput {
  requestId?: string;

  userId?: string;

  email?: string;

  action: AuthAction;

  success: boolean;

  ipAddress?: string;

  userAgent?: string;

  metadata?: Prisma.InputJsonValue;
}
export interface SecurityLogInput {
  requestId?: string;

  userId?: string;

  event: SecurityEvent;

  severity: SecuritySeverity;

  ipAddress?: string;

  userAgent?: string;

  requestPath?: string;

  requestMethod?: string;

  metadata?: Prisma.InputJsonValue;
}

export interface ApiLogInput {
  requestId?: string;

  userId?: string;

  method: string;

  path: string;

  statusCode: number;

  durationMs: number;

  ipAddress?: string;

  userAgent?: string;
}