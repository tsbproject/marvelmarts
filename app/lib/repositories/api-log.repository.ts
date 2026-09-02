import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  ApiLogInput,
  LogDateRange,
  LogPagination,
  LogQueryResult,
} from "@/app/lib/logging";

export interface ApiLogQuery
  extends LogPagination,
    LogDateRange {
  search?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
}

export class ApiLogRepository {
  static create(data: ApiLogInput) {
    return prisma.apiLog.create({
      data,
    });
  }

  private static buildWhere(
    query: Omit<ApiLogQuery, "page" | "pageSize">
  ): Prisma.ApiLogWhereInput {
    const {
      dateFrom,
      dateTo,
      search,
      method,
      statusCode,
      userId,
    } = query;

    return {
      ...(search
        ? {
            OR: [
              {
                method: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                path: {
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
                ipAddress: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(method ? { method } : {}),
      ...(statusCode !== undefined
        ? { statusCode }
        : {}),
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
    where: Prisma.ApiLogWhereInput,
    page: number,
    pageSize: number
  ) {
    return prisma.apiLog.findMany({
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
    query: ApiLogQuery
  ): Promise<
    LogQueryResult<
      Awaited<ReturnType<typeof ApiLogRepository.findMany>>[number]
    >
  > {
    const {
      page,
      pageSize,
    } = query;

    const where = ApiLogRepository.buildWhere(query);

    const [items, total] = await prisma.$transaction([
      ApiLogRepository.findMany(
        where,
        page,
        pageSize
      ),
      prisma.apiLog.count({ where }),
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
    return prisma.apiLog.findUnique({
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
    query: Omit<ApiLogQuery, "page" | "pageSize">
  ) {
    const where = ApiLogRepository.buildWhere(query);

    return prisma.apiLog.findMany({
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