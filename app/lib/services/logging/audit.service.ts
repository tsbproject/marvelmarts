import { logger } from "@/app/lib/logger";
import { getCurrentRequestId } from "@/app/lib/logging/request-context";

import {
  AuditAction,
  AuditLogInput,
} from "@/app/lib/logging";

import { AuditRepository } from "@/app/lib/repositories/audit.repository";



export class AuditService {
 private static async write(
  data: AuditLogInput
) {
  try {
    await AuditRepository.create({
      ...data,
      requestId:
        data.requestId ??
        getCurrentRequestId(),
    });
  } catch (error) {
    logger.error(
      "AUDIT_LOG_FAILED",
      error
    );
  }
}

  static async productCreated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_CREATED,
      entity: "Product",
    });
  }

  static async productUpdated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_UPDATED,
      entity: "Product",
    });
  }

  static async productDeleted(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_DELETED,
      entity: "Product",
    });
  }

  static async vendorApproved(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.VENDOR_APPROVED,
      entity: "Vendor",
    });
  }

  static async vendorRejected(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.VENDOR_REJECTED,
      entity: "Vendor",
    });
  }

  static async vendorSuspended(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.VENDOR_SUSPENDED,
      entity: "Vendor",
    });
  }

  static async vendorUnsuspended(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.VENDOR_UNSUSPENDED,
      entity: "Vendor",
    });
  }

  static async orderCreated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ORDER_CREATED,
      entity: "Order",
    });
  }

  static async orderCancelled(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ORDER_CANCELLED,
      entity: "Order",
    });
  }

  static async orderRefunded(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ORDER_REFUNDED,
      entity: "Order",
    });
  }

  static async orderStatusChanged(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ORDER_STATUS_CHANGED,
      entity: "Order",
    });
  }

  static async payoutApproved(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PAYOUT_APPROVED,
      entity: "Payout",
    });
  }

  static async payoutRejected(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PAYOUT_REJECTED,
      entity: "Payout",
    });
  }

  static async walletFunded(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.WALLET_FUNDED,
      entity: "Wallet",
    });
  }

  static async walletWithdrawn(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.WALLET_WITHDRAWN,
      entity: "Wallet",
    });
  }

  static async categoryCreated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.CATEGORY_CREATED,
      entity: "Category",
    });
  }

  static async categoryUpdated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.CATEGORY_UPDATED,
      entity: "Category",
    });
  }

  static async categoryDeleted(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.CATEGORY_DELETED,
      entity: "Category",
    });
  }

  static async adminCreated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ADMIN_CREATED,
      entity: "Admin",
    });
  }

  static async adminUpdated(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ADMIN_UPDATED,
      entity: "Admin",
    });
  }

  static async adminDeleted(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ADMIN_DELETED,
      entity: "Admin",
    });
  }

  static async roleChanged(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.ROLE_CHANGED,
      entity: "User",
    });
  }

  static async vendorUpdated(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.VENDOR_UPDATED,
    entity: "Vendor",
  });
}


static async userUpdated(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.USER_UPDATED,
    entity: "USER",
  });
}
}