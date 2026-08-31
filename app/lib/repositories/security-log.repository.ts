import { prisma } from "@/app/lib/prisma";

import { SecurityLogInput } from "@/app/lib/logging";

export class SecurityLogRepository {
  static create(data: SecurityLogInput) {
    return prisma.securityLog.create({
      data: {
        requestId: data.requestId,

        userId: data.userId,

        event: data.event,

        severity: data.severity,

        ipAddress: data.ipAddress,

        userAgent: data.userAgent,

        requestPath: data.requestPath,

        requestMethod: data.requestMethod,

        metadata: data.metadata,
      },
    });
  }
}