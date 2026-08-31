import { logger } from "@/app/lib/logger";

import {
  AuthAction,
  AuthLogInput,
} from "@/app/lib/logging";

import { AuthLogRepository } from "@/app/lib/repositories/auth-log.repository";
import { getCurrentRequestId } from "@/app/lib/logging/request-context";


export class AuthLogService {
  private static async write(
  data: AuthLogInput
) {
  try {
    await AuthLogRepository.create({
      ...data,
      requestId:
        data.requestId ??
        getCurrentRequestId(),
    });
  } catch (error) {
    logger.error(
      "AUTH_LOG_FAILED",
      error
    );
  }
}

  static async loginSuccess(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.LOGIN_SUCCESS,
      success: true,
    });
  }

  static async loginFailure(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.LOGIN_FAILED,
      success: false,
    });
  }

  static async logout(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.LOGOUT,
      success: true,
    });
  }

  static async customerRegistered(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.CUSTOMER_REGISTERED,
      success: true,
    });
  }

  static async vendorRegistered(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.VENDOR_REGISTERED,
      success: true,
    });
  }

  static async customerVerified(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.CUSTOMER_VERIFIED,
      success: true,
    });
  }

  static async vendorVerified(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.VENDOR_VERIFIED,
      success: true,
    });
  }

  static async passwordChanged(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.PASSWORD_CHANGED,
      success: true,
    });
  }

  static async passwordResetRequested(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.PASSWORD_RESET_REQUESTED,
      success: true,
    });
  }

  static async passwordResetCompleted(
    data: Omit<AuthLogInput, "action" | "success">
  ) {
    return this.write({
      ...data,
      action: AuthAction.PASSWORD_RESET_COMPLETED,
      success: true,
    });
  }
}