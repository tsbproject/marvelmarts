import { prisma } from "@/app/lib/prisma";

import { AuthLogInput } from "@/app/lib/logging";

export class AuthLogRepository {
  static create(data: AuthLogInput) {
    return prisma.authLog.create({
      data,
    });
  }
}