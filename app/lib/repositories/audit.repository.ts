import { prisma } from "@/app/lib/prisma";
import type { Prisma, UserRole } from "@prisma/client";

import {
  AuditLogInput,
  LogDateRange,
  LogPagination,
  LogQueryResult,
} from "@/app/lib/logging";

export interface AuditLogQuery
  extends LogPagination,
    LogDateRange {
  search?: string;
  action?: string;
  entity?: string;
  actorId?: string;
  actorRole?: UserRole;
}

export class AuditRepository {
  
 static create(data: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      requestId: data.requestId,
      requestPath: data.requestPath,
      requestMethod: data.requestMethod,
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

  private static buildWhere(
    query: Omit<AuditLogQuery, "page" | "pageSize">
  ): Prisma.AuditLogWhereInput {
    const {
      dateFrom,
      dateTo,
      search,
      action,
      entity,
      actorId,
      actorRole,
    } = query;

    return {
      ...(search
        ? {
            OR: [
              {
                action: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                entity: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                entityId: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                requestId: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
      ...(actorId ? { actorId } : {}),
      ...(actorRole
        ? {
            actorRole,
          }
        : {}),

      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    };
  }

  private static findMany(
    where: Prisma.AuditLogWhereInput,
    page: number,
    pageSize: number
  ) {
    return prisma.auditLog.findMany({
      where,
      include: {
        actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  static async list(
    query: AuditLogQuery
  ): Promise<
    LogQueryResult<
      Awaited<ReturnType<typeof AuditRepository.findMany>>[number]
    >
  > {
    const {
      page,
      pageSize,
    } = query;

    const where = AuditRepository.buildWhere(query);

    const [items, total] = await prisma.$transaction([
      AuditRepository.findMany(where, page, pageSize),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async export(
    query: Omit<AuditLogQuery, "page" | "pageSize">
  ) {
    const where = AuditRepository.buildWhere(query);

    return prisma.auditLog.findMany({
      where,
      include: {
        actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    });
  }
}