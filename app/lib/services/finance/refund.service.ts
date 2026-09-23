import { Prisma } from "@prisma/client";

import prisma from "@/app/lib/prisma";
import { PaymentService } from "@/app/lib/services/payment.service";
import { RefundFinancialService } from "@/app/lib/services/finance/refund-financial.service";
import { badRequest, notFound } from "@/app/lib/auth/errors";
import { AuditService } from "@/app/lib/services/logging/audit.service";

export class RefundService {
  static async processApprovedRefund(
    orderId: string,
    actorId: string
  ) {
    if (!orderId?.trim()) {
      throw badRequest("Order ID is required.");
    }

    if (!actorId?.trim()) {
      throw badRequest("Refund processor identity is required.");
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        refundStatus: true,
        refundReason: true,
        refundReference: true,
        total: true,
        paymentStatus: true,
        paymentIntentId: true,
        userId: true,
      },
    });

    if (!order) {
      throw notFound("Order not found.");
    }

    /*
     * Idempotency:
     * A completed refund must never be submitted to Paystack again.
     */
    if (
      order.refundStatus === "completed" &&
      order.refundReference
    ) {
      return {
        order,
        providerRefundReference:
          order.refundReference,
        alreadyCompleted: true,
      };
    }

    if (order.refundStatus !== "approved") {
      throw badRequest(
        "Only approved refunds can be processed."
      );
    }

    if (!order.paymentStatus) {
      throw badRequest(
        "Only paid orders can be refunded."
      );
    }

    if (!order.paymentIntentId?.trim()) {
      throw badRequest(
        "Paid order is missing its payment reference."
      );
    }

    const amount = new Prisma.Decimal(order.total);

    if (!amount.gt(0)) {
      throw badRequest(
        "Refund amount must be greater than zero."
      );
    }

    /*
     * Atomically claim the approved refund before contacting Paystack.
     *
     * Only one concurrent request can transition the refund from
     * APPROVED -> PROCESSING.
     *
     * This prevents two administrators or two concurrent requests
     * from submitting the same refund to Paystack.
     */
    const claimResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        refundStatus: "approved",
      },
      data: {
        refundStatus: "processing",
      },
    });

    /*
     * If no row was updated, another request has already claimed
     * the refund or its state changed between the initial read
     * and this atomic claim.
     */
    if (claimResult.count !== 1) {
      const currentRefund = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        select: {
          refundStatus: true,
          refundReference: true,
        },
      });

      /*
       * Another request may have completed the refund while this
       * request was attempting to claim it.
       *
       * Treat that as successful idempotent completion.
       */
      if (
        currentRefund?.refundStatus === "completed" &&
        currentRefund.refundReference
      ) {
        return {
          order,
          providerRefundReference:
            currentRefund.refundReference,
          alreadyCompleted: true,
        };
      }

      throw badRequest(
        "This refund is already being processed or is no longer approved."
      );
    }

    /*
     * Re-read the order after successfully claiming the refund.
     *
     * This ensures the provider call uses the state belonging to
     * the request that actually acquired the processing lock.
     */
    const processingOrder =
      await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          refundStatus: true,
          refundReason: true,
          refundReference: true,
          total: true,
          paymentStatus: true,
          paymentIntentId: true,
          userId: true,
        },
      });

    if (!processingOrder) {
      throw notFound(
        "Order not found after claiming refund."
      );
    }

    if (
      processingOrder.refundStatus !== "processing"
    ) {
      throw badRequest(
        "Refund could not be placed into processing state."
      );
    }

    if (!processingOrder.paymentStatus) {
      throw badRequest(
        "Only paid orders can be refunded."
      );
    }

    if (!processingOrder.paymentIntentId?.trim()) {
      throw badRequest(
        "Paid order is missing its payment reference."
      );
    }

    /*
     * Provider refund.
     *
     * PaymentService expects Naira, while PaystackClient handles
     * conversion to kobo.
     */
    let providerResult;

    try {
      providerResult =
        await PaymentService.refund({
          reference:
            processingOrder.paymentIntentId,
          amount: amount.toNumber(),
          reason:
            processingOrder.refundReason ??
            `Refund for order ${processingOrder.orderNumber}`,
        });
    } catch (error) {
      /*
       * Provider failure occurred before the refund was accepted.
       * No financial reversal has been posted, so FAILED is safe.
       */
      await prisma.order.update({
        where: {
          id: processingOrder.id,
        },
        data: {
          refundStatus: "failed",
        },
      });

      throw error;
    }

    if (!providerResult.success) {
      /*
       * Provider explicitly reported failure.
       * No financial reversal has been posted.
       */
      await prisma.order.update({
        where: {
          id: processingOrder.id,
        },
        data: {
          refundStatus: "failed",
        },
      });

      throw badRequest(
        providerResult.message ??
          "Payment provider did not complete the refund."
      );
    }

    /*
     * Paystack has accepted the refund.
     *
     * We deliberately do not mark the order "refunded" until the
     * corresponding internal financial reversal has been posted.
     */
    const providerRefundReference =
      providerResult.refundReference ??
      providerResult.reference;

    if (!providerRefundReference?.trim()) {
      /*
       * Paystack accepted the refund but did not provide a usable
       * refund reference. Keep the order in PROCESSING because the
       * provider movement has already occurred and reconciliation
       * is required.
       */
      await prisma.order.update({
        where: {
          id: processingOrder.id,
        },
        data: {
          refundStatus: "processing",
        },
      });

      throw badRequest(
        "Payment provider accepted the refund but did not return a refund reference. Reconciliation is required."
      );
    }

    try {
      /*
       * Post the internal financial reversal.
       *
       * This creates compensating ledger transactions rather than
       * mutating or deleting the original sale entries.
       */
      const financialResult =
        await RefundFinancialService.postFullRefund({
          orderId: processingOrder.id,
          actorUserId: actorId,
        });

      /*
       * Only after the provider refund and internal financial
       * reversal succeed do we finalize the order.
       */
      const completedOrder =
        await prisma.order.update({
          where: {
            id: processingOrder.id,
          },
          data: {
            status: "refunded",
            refundStatus: "completed",
            refundReference:
              providerRefundReference,
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            refundStatus: true,
            refundReason: true,
            refundReference: true,
            total: true,
            paymentStatus: true,
            paymentIntentId: true,
            userId: true,
          },
        });

      /*
       * Audit the completed financial refund.
       */
      await AuditService.orderRefunded({
        actorId,
        entityId: completedOrder.id,
        oldValues: {
          status: processingOrder.status,
          refundStatus:
            processingOrder.refundStatus,
          refundReference:
            processingOrder.refundReference,
        },
        newValues: {
          status: completedOrder.status,
          refundStatus:
            completedOrder.refundStatus,
          refundReference:
            completedOrder.refundReference,
          providerStatus:
            providerResult.status,
          financialAllocationTransactionId:
            financialResult.allocationTransactionId,
          financialPaymentTransactionId:
            financialResult.paymentTransactionId,
        },
      });

      return {
        order: completedOrder,
        providerRefundReference,
        providerStatus: providerResult.status,
        financialResult,
        alreadyCompleted: false,
      };
    } catch (error) {
      /*
       * Paystack has already accepted the refund, so this is NOT a
       * provider failure.
       *
       * Keep the order in PROCESSING so it can be reconciled/retried.
       * Do not issue another Paystack refund and do not create a
       * REFUND_REVERSAL here.
       */
      await prisma.order.update({
        where: {
          id: processingOrder.id,
        },
        data: {
          refundStatus: "processing",
          refundReference:
            providerRefundReference,
        },
      });

      throw error;
    }
  }
}