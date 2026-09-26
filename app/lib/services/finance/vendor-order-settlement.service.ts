import {
  FinancialTransactionType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

const DELIVERY_RELEASE_PREFIX =
  "VENDOR-DELIVERY-RELEASE";

type TransactionClient = Prisma.TransactionClient;

export class VendorOrderSettlementService {
  /**
   * Marks a VendorOrder as DELIVERED and releases its vendorNet
   * into the vendor's operational balance.
   *
   * When called without a transaction client, this method creates
   * its own transaction.
   *
   * When called with a transaction client, all operations participate
   * in the caller's existing transaction.
   *
   * IMPORTANT:
   * - Vendor Payable is created during SALE-ALLOCATION.
   * - This method does NOT create another payable.
   * - This method only releases the already-allocated vendorNet
   *   into the vendor's available operational balance.
   */
  static async markDeliveredAndReleaseVendorBalance(
    vendorOrderId: string,
    tx?: TransactionClient
  ) {
    if (!vendorOrderId?.trim()) {
      throw badRequest(
        "Vendor order ID is required."
      );
    }

    if (tx) {
      return this.releaseVendorBalance(
        tx,
        vendorOrderId
      );
    }

    return prisma.$transaction(
      async (transaction) => {
        return this.releaseVendorBalance(
          transaction,
          vendorOrderId
        );
      }
    );
  }

  private static async releaseVendorBalance(
    tx: TransactionClient,
    vendorOrderId: string
  ) {
    const idempotencyKey =
      `${DELIVERY_RELEASE_PREFIX}-${vendorOrderId}`;

    const vendorOrder =
      await tx.vendorOrder.findUnique({
        where: {
          id: vendorOrderId,
        },
        select: {
          id: true,
          orderId: true,
          vendorProfileId: true,
          status: true,
          vendorNet: true,
        },
      });

    if (!vendorOrder) {
      throw notFound("Vendor order not found.");
    }

    const vendorNet = Number(
      vendorOrder.vendorNet
    );

    if (
      !Number.isFinite(vendorNet) ||
      vendorNet < 0
    ) {
      throw badRequest(
        "Vendor order has an invalid vendor settlement amount."
      );
    }

    const existingRelease =
      await tx.financialTransaction.findUnique({
        where: {
          idempotencyKey,
        },
        select: {
          id: true,
          reference: true,
          status: true,
          amount: true,
        },
      });

    if (existingRelease) {
      const currentVendorOrder =
        await tx.vendorOrder.findUnique({
          where: {
            id: vendorOrderId,
          },
          select: {
            id: true,
            status: true,
            vendorNet: true,
          },
        });

      return {
        vendorOrder: currentVendorOrder,
        releasedAmount: Number(
          existingRelease.amount
        ),
        alreadyReleased: true,
        transaction: existingRelease,
      };
    }

    if (
      vendorOrder.status !== "PENDING" &&
      vendorOrder.status !== "APPROVED" &&
      vendorOrder.status !== "DELIVERED"
    ) {
      throw badRequest(
        `Vendor order cannot be delivered from ${vendorOrder.status}.`
      );
    }

    const updatedVendorOrder =
      await tx.vendorOrder.update({
        where: {
          id: vendorOrderId,
        },
        data: {
          status: "DELIVERED",
        },
        select: {
          id: true,
          orderId: true,
          vendorProfileId: true,
          status: true,
          vendorNet: true,
        },
      });

    if (vendorNet > 0) {
      await tx.vendorProfile.update({
        where: {
          id: vendorOrder.vendorProfileId,
        },
        data: {
          balance: {
            increment: vendorNet,
          },
        },
      });
    }
    const transaction =
    await tx.financialTransaction.create({
        data: {
          reference:
            `DELIVERY-${vendorOrder.id}`,
          type:
            FinancialTransactionType.DELIVERY_SETTLEMENT,
          status: "POSTED",
          amount: vendorNet,
          currency: "NGN",
          description:
            "Vendor earnings released after VendorOrder delivery.",
          orderId: vendorOrder.orderId,
          vendorProfileId:
            vendorOrder.vendorProfileId,
          idempotencyKey,
          metadata: {
            vendorOrderId: vendorOrder.id,
            vendorNet,
            source: "SHIPMENT_DELIVERY",
          },
        },
        select: {
          id: true,
          reference: true,
          status: true,
          amount: true,
          idempotencyKey: true,
        },
      });

         const remainingVendorOrder =
      await tx.vendorOrder.findFirst({
        where: {
          orderId: vendorOrder.orderId,
          status: {
            not: "DELIVERED",
          },
        },
        select: {
          id: true,
        },
      });

    if (!remainingVendorOrder) {
      const parentOrder =
        await tx.order.findUnique({
          where: {
            id: vendorOrder.orderId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      const parentStatus =
        String(parentOrder?.status ?? "").toUpperCase();

      if (
        parentOrder &&
        parentStatus !== "DELIVERED" &&
        parentStatus !== "CANCELLED" &&
        parentStatus !== "REFUNDED"
      ) {
       await tx.order.update({
          where: {
            id: parentOrder.id,
          },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        });
      }
    }
   
    return {
      vendorOrder: updatedVendorOrder,
      releasedAmount: vendorNet,
      alreadyReleased: false,
      transaction,
    };
  }
}