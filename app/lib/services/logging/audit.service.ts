import {
  Role,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { logger } from "@/app/lib/logger";
import {
  getCurrentRequestId,
  getCurrentRequestIp,
  getCurrentRequestUserAgent,
  getCurrentRequestPath,
  getCurrentRequestMethod,
} from "@/app/lib/logging/request-context";

import {
  AuditAction,
  AuditLogInput,
} from "@/app/lib/logging";

import { AuditRepository } from "@/app/lib/repositories/audit.repository";
import {
  redactJson,
} from "@/app/lib/logging/redaction";

import type { AuditLogQuery } from "@/app/lib/repositories/audit.repository";



function toAuditRole(
  role: UserRole | null | undefined,
): UserRole | undefined {
  return role ?? undefined;
}


export class AuditService {
  
 private static async write(
  data: AuditLogInput
) {
  try {
    let actorRole = data.actorRole;

    if (!actorRole && data.actorId) {
      const actor = await prisma.user.findUnique({
        where: {
          id: data.actorId,
        },
        select: {
          role: true,
        },
      });

      actorRole = toAuditRole(actor?.role);
    }

   await AuditRepository.create({
  ...data,
    actorRole,
    requestId: data.requestId ?? getCurrentRequestId(),
    requestPath: data.requestPath ?? getCurrentRequestPath(),
    requestMethod: data.requestMethod ?? getCurrentRequestMethod(),
    ipAddress: data.ipAddress ?? getCurrentRequestIp(),
    userAgent: data.userAgent ?? getCurrentRequestUserAgent(),
    oldValues: redactJson(data.oldValues),
    newValues: redactJson(data.newValues),
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


  static async productPublicationChanged(
  data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_PUBLICATION_CHANGED,
      entity: "Product",
    });
  }

  static async productTrendingChanged(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_TRENDING_CHANGED,
      entity: "Product",
    });
  }

  static async productFlagsBulkChanged(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.PRODUCT_FLAGS_BULK_CHANGED,
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


  static async payoutRequested(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.PAYOUT_REQUESTED,
    entity: "Payout",
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


  static async withdrawalRequested(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.WITHDRAWAL_REQUESTED,
    entity: "Withdrawal",
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


  static async courierCreated(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.COURIER_CREATED,
    entity: "Courier",
  });
}

static async courierUpdated(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.COURIER_UPDATED,
    entity: "Courier",
  });
}

static async courierStatusChanged(
  data: Omit<AuditLogInput, "action" | "entity">
) {
  return this.write({
    ...data,
    action: AuditAction.COURIER_STATUS_CHANGED,
    entity: "Courier",
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


    static async refundRequested(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.REFUND_REQUESTED,
      entity: "Order",
    });
  }

  static async refundApproved(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.REFUND_APPROVED,
      entity: "Order",
    });
  }

  static async refundRejected(
    data: Omit<AuditLogInput, "action" | "entity">
  ) {
    return this.write({
      ...data,
      action: AuditAction.REFUND_REJECTED,
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



    static async payoutFinalized(
      data: Omit<AuditLogInput, "action" | "entity">
    ) {
      return this.write({
        ...data,
        action: AuditAction.PAYOUT_FINALIZED,
        entity: "MarketplaceTransaction",
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



  static async vendorBoostCreditsPurchased(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
  ) {
    return this.write({
      ...data,
      action:
        AuditAction.VENDOR_BOOST_CREDITS_PURCHASED,
      entity: "VendorBoost",
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


static async list(query: AuditLogQuery) {
  return AuditRepository.list(query);
}

static async findById(id: string) {
  return AuditRepository.findById(id);
}


static async export(
  query: Omit<AuditLogQuery, "page" | "pageSize">
) {
  return AuditRepository.export(query);
}


static async reviewApprovalChanged(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
  ) {
    return this.write({
      ...data,
      action:
        AuditAction.REVIEW_APPROVAL_CHANGED,
      entity: "Review",
    });
  }

  static async reviewsBulkApprovalChanged(
    data: Omit<
      AuditLogInput,
      "action" | "entity"
    >
  ) {
    return this.write({
      ...data,
      action:
        AuditAction.REVIEWS_BULK_APPROVAL_CHANGED,
      entity: "Review",
    });
  }

  static async reviewsBulkDeleted(
    data: Omit<
      AuditLogInput,
      "action" | "entity"
    >
  ) {
    return this.write({
      ...data,
      action:
        AuditAction.REVIEWS_BULK_DELETED,
      entity: "Review",
    });
  }

  static async reviewDeleted(
    data: Omit<
      AuditLogInput,
      "action" | "entity"
    >
  ) {
    return this.write({
      ...data,
      action:
        AuditAction.REVIEW_DELETED,
      entity: "Review",
    });
  }


  static async variantCreated(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.VARIANT_CREATED,
    entity: "ProductVariant",
  });
}

static async variantDeleted(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.VARIANT_DELETED,
    entity: "ProductVariant",
  });
}

static async productImageAdded(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.PRODUCT_IMAGE_ADDED,
    entity: "ProductImage",
  });
}

static async productImagesAdded(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.PRODUCT_IMAGES_ADDED,
    entity: "ProductImage",
  });
}

static async productImageDeleted(
  data: Omit<
    AuditLogInput,
    "action" | "entity"
  >
) {
  return this.write({
    ...data,
    action: AuditAction.PRODUCT_IMAGE_DELETED,
    entity: "ProductImage",
  });
}
}