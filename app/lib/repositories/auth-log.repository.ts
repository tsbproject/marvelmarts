import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  AuthLogInput,
  LogDateRange,
  LogPagination,
  LogQueryResult,
} from "@/app/lib/logging";

export interface AuthLogQuery
  extends LogPagination,
    LogDateRange {
  search?: string;
  action?: string;
  success?: boolean;
  userId?: string;
}

export class AuthLogRepository {
  static create(data: AuthLogInput) {
    return prisma.authLog.create({
      data,
    });
  }

  private static buildWhere(
    query: Omit<AuthLogQuery, "page" | "pageSize">
  ): Prisma.AuthLogWhereInput {
    const {
      dateFrom,
      dateTo,
      search,
      action,
      success,
      userId,
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
                email: {
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

      ...(success !== undefined
        ? { success }
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
    where: Prisma.AuthLogWhereInput,
    page: number,
    pageSize: number
  ) {
    return prisma.authLog.findMany({
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
    query: AuthLogQuery
  ): Promise<
    LogQueryResult<
      Awaited<ReturnType<typeof AuthLogRepository.findMany>>[number]
    >
  > {
    const {
      page,
      pageSize,
    } = query;

    const where = AuthLogRepository.buildWhere(query);

    const [items, total] = await prisma.$transaction([
      AuthLogRepository.findMany(
        where,
        page,
        pageSize
      ),
      prisma.authLog.count({ where }),
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
    return prisma.authLog.findUnique({
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
    query: Omit<AuthLogQuery, "page" | "pageSize">
  ) {
    const where = AuthLogRepository.buildWhere(query);

    return prisma.authLog.findMany({
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