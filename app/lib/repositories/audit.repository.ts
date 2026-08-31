import { prisma } from "@/app/lib/prisma";
import { AuditLogInput } from "@/app/lib/logging";

export class AuditRepository {
  static create(data: AuditLogInput) {
    return prisma.auditLog.create({
      data: {
        requestId: data.requestId,

        actorId: data.actorId,

        actorRole: data.actorRole,

        action: data.action,

        entity: data.entity,

        entityId: data.entityId,

        oldValues: data.oldValues,

        newValues: data.newValues,

        ipAddress: data.ipAddress,

        userAgent: data.userAgent,
      },
    });
  }
}