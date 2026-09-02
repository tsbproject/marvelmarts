import { logger } from "@/app/lib/logger";
import { ApiLogInput } from "@/app/lib/logging";
import { ApiLogRepository } from "@/app/lib/repositories/api-log.repository";
import type { ApiLogQuery } from "@/app/lib/repositories/api-log.repository";


export class ApiLogService {
  static async log(data: ApiLogInput) {
    try {
      await ApiLogRepository.create(data);
    } catch (error) {
      logger.error("API_LOG_FAILED", error);
    }
  }

  static async list(query: ApiLogQuery) {
    return ApiLogRepository.list(query);
  }

  static async findById(id: string) {
    return ApiLogRepository.findById(id);
  }


  static async export(
      query: Omit<ApiLogQuery, "page" | "pageSize">
    ) {
      return ApiLogRepository.export(query);
    }
    }