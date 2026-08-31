import { logger } from "@/app/lib/logger";

import {
  SecurityEvent,
  SecurityLogInput,
  SecuritySeverity,
} from "@/app/lib/logging";

import { SecurityLogRepository } from "@/app/lib/repositories/security-log.repository";
import { getCurrentRequestId } from "@/app/lib/logging/request-context";

export class SecurityLogService {
  private static async write(
  data: SecurityLogInput
) {
  try {
    await SecurityLogRepository.create({
      ...data,
      requestId:
        data.requestId ??
        getCurrentRequestId(),
    });
  } catch (error) {
    logger.error(
      "SECURITY_LOG_FAILED",
      error
    );
  }
}

  static async csrfBlocked(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.CSRF_BLOCKED,
      severity: SecuritySeverity.HIGH,
    });
  }

  static async permissionDenied(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.PERMISSION_DENIED,
      severity: SecuritySeverity.MEDIUM,
    });
  }

  static async rateLimitExceeded(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.MEDIUM,
    });
  }

  static async invalidPayment(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.INVALID_PAYMENT,
      severity: SecuritySeverity.HIGH,
    });
  }

  static async webhookSignatureFailed(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.WEBHOOK_SIGNATURE_FAILED,
      severity: SecuritySeverity.CRITICAL,
    });
  }

  static async replayAttack(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.REPLAY_ATTACK,
      severity: SecuritySeverity.CRITICAL,
    });
  }

  static async suspiciousActivity(
    data: Omit<SecurityLogInput, "event" | "severity">
  ) {
    return this.write({
      ...data,
      event: SecurityEvent.SUSPICIOUS_ACTIVITY,
      severity: SecuritySeverity.HIGH,
    });
  }
}