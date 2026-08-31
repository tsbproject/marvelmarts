import { logger } from "@/app/lib/logger";
import { ApiLogInput } from "@/app/lib/logging";
import { ApiLogRepository } from "@/app/lib/repositories/api-log.repository";

export class ApiLogService {
  static async log(data: ApiLogInput) {
    try {
      await ApiLogRepository.create(data);
    } catch (error) {
      logger.error("API_LOG_FAILED", error);
    }
  }
}