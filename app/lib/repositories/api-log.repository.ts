import { prisma } from "@/app/lib/prisma";

import { ApiLogInput } from "@/app/lib/logging";

export class ApiLogRepository {
  static create(data: ApiLogInput) {
    return prisma.apiLog.create({
      data,
    });
  }
}