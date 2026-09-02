import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  LogDateRange,
  LogPagination,
  LogQueryResult,
  SecurityLogInput,
} from "@/app/lib/logging";

export interface SecurityLogQuery
  extends LogPagination,
    LogDateRange {
  search?: string;
  event?: string;
  severity?: string;
  userId?: string;
}

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

  private static buildWhere(
    query: Omit<SecurityLogQuery, "page" | "pageSize">
  ): Prisma.SecurityLogWhereInput {
    const {
      dateFrom,
      dateTo,
      search,
      event,
      severity,
      userId,
    } = query;

    return {
      ...(search
        ? {
            OR: [
              {
                event: {
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
              {
                requestPath: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                requestMethod: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                ipAddress: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(event ? { event } : {}),
      ...(severity ? { severity } : {}),
      ...(userId ? { userId } : {}),

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
    where: Prisma.SecurityLogWhereInput,
    page: number,
    pageSize: number
  ) {
    return prisma.securityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
    query: SecurityLogQuery
  ): Promise<
    LogQueryResult<
      Awaited<ReturnType<typeof SecurityLogRepository.findMany>>[number]
    >
  > {
    const {
      page,
      pageSize,
    } = query;

    const where = SecurityLogRepository.buildWhere(query);

    const [items, total] = await prisma.$transaction([
      SecurityLogRepository.findMany(
        where,
        page,
        pageSize
      ),
      prisma.securityLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static findById(id: string) {
    return prisma.securityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }


  static async export(
    query: Omit<SecurityLogQuery, "page" | "pageSize">
  ) {
    const where =
      SecurityLogRepository.buildWhere(query);

    return prisma.securityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}