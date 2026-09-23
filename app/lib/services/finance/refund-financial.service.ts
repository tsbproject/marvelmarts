import { FinancialTransactionType, Prisma } from "@prisma/client";

import prisma from "@/app/lib/prisma";
import {
  FinancialPostingError,
  postFinancialTransaction,
} from "@/app/lib/services/finance/financial-posting.service";

const PAYSTACK_CLEARING_ACCOUNT = "1010";
const ORDER_CLEARING_ACCOUNT = "1100";
const VENDOR_PAYABLE_ACCOUNT = "2000";
const COMMISSION_REVENUE_ACCOUNT = "4000";
const SHIPPING_REVENUE_ACCOUNT = "4010";

type RefundFinancialPostingInput = {
  orderId: string;
  actorUserId?: string;
  occurredAt?: Date;
};

function decimal(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0);
}

function assertExistingTransaction(
  transaction: {
    reference: string;
    type: FinancialTransactionType;
    amount: Prisma.Decimal;
    orderId: string | null;
  },
  expected: {
    reference: string;
    type: FinancialTransactionType;
    amount: Prisma.Decimal;
    orderId: string;
  }
) {
  if (
    transaction.reference !== expected.reference ||
    transaction.type !== expected.type ||
    !transaction.amount.eq(expected.amount) ||
    transaction.orderId !== expected.orderId
  ) {
    throw new FinancialPostingError(
      `Existing financial transaction "${expected.reference}" does not match the expected refund posting.`
    );
  }
}

export class RefundFinancialService {
  /**
   * Posts the accounting side of a full customer refund.
   *
   * This method does not call Paystack and does not mutate Order/VendorOrder
   * state. Provider orchestration belongs to the refund workflow.
   *
   * Full refund accounting:
   *
   * 1. Reverse the original marketplace allocation:
   *      Dr Vendor Payable
   *      Dr Marketplace Commission Revenue
   *      Dr Shipping Revenue
   *          Cr Order Clearing
   *
   * 2. Record the customer refund movement:
   *      Dr Order Clearing
   *          Cr Paystack Clearing
   *
   * Both postings are idempotent through deterministic references.
   */
  static async postFullRefund(input: RefundFinancialPostingInput) {
    if (!input.orderId?.trim()) {
      throw new FinancialPostingError("Order ID is required for refund posting.");
    }

    const order = await prisma.order.findUnique({
      where: {
        id: input.orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        subtotal: true,
        shipping: true,
        paymentStatus: true,
        paymentIntentId: true,
        vendorOrders: {
          select: {
            id: true,
            vendorProfileId: true,
            merchandiseSubtotal: true,
            shipping: true,
            total: true,
            commissionAmount: true,
            vendorNet: true,
          },
        },
      },
    });

    if (!order) {
      throw new FinancialPostingError("Order not found.");
    }

    if (!order.paymentStatus) {
      throw new FinancialPostingError(
        "Only paid orders can receive a financial refund posting."
      );
    }

    if (!order.paymentIntentId?.trim()) {
      throw new FinancialPostingError(
        "Paid order is missing its payment reference."
      );
    }

    const orderTotal = decimal(order.total);
    const orderSubtotal = decimal(order.subtotal);
    const orderShipping = decimal(order.shipping);

    if (!orderTotal.gt(0)) {
      throw new FinancialPostingError(
        "Refund order total must be greater than zero."
      );
    }

    if (!orderTotal.eq(orderSubtotal.plus(orderShipping))) {
      throw new FinancialPostingError(
        "Order total does not reconcile with subtotal plus shipping."
      );
    }

    if (order.vendorOrders.length === 0) {
      throw new FinancialPostingError(
        "Refund cannot be posted because the order has no vendor allocations."
      );
    }

    let vendorNetTotal = new Prisma.Decimal(0);
    let commissionTotal = new Prisma.Decimal(0);
    let vendorMerchandiseTotal = new Prisma.Decimal(0);
    let vendorOrderTotal = new Prisma.Decimal(0);

    const vendorEntries = order.vendorOrders.map((vendorOrder) => {
      const merchandiseSubtotal = decimal(vendorOrder.merchandiseSubtotal);
      const shipping = decimal(vendorOrder.shipping);
      const vendorOrderTotalValue = decimal(vendorOrder.total);
      const commission = decimal(vendorOrder.commissionAmount);
      const vendorNet = decimal(vendorOrder.vendorNet);

      if (!vendorNet.gt(0)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" is missing a valid vendor net amount.`
        );
      }

      if (!commission.gte(0)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" has an invalid commission amount.`
        );
      }

      if (!merchandiseSubtotal.gt(0)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" has an invalid merchandise subtotal.`
        );
      }

      if (!vendorOrderTotalValue.eq(merchandiseSubtotal.plus(shipping))) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" does not reconcile: total must equal merchandise subtotal plus shipping.`
        );
      }

      if (!vendorNet.plus(commission).eq(merchandiseSubtotal)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" does not reconcile: vendor net plus commission must equal merchandise subtotal.`
        );
      }

      vendorNetTotal = vendorNetTotal.plus(vendorNet);
      commissionTotal = commissionTotal.plus(commission);
      vendorMerchandiseTotal =
      vendorMerchandiseTotal.plus(merchandiseSubtotal);
      vendorOrderTotal = vendorOrderTotal.plus(vendorOrderTotalValue);

      return {
        accountCode: VENDOR_PAYABLE_ACCOUNT,
        debit: vendorNet,
        description: `Refund vendor payable reversal — ${order.orderNumber}`,
        vendorProfileId: vendorOrder.vendorProfileId,
        orderId: order.id,
      };
    });

    if (!vendorMerchandiseTotal.eq(orderSubtotal)) {
      throw new FinancialPostingError(
        "Vendor merchandise allocations do not reconcile with the order subtotal."
      );
    }

    if (!vendorOrderTotal.eq(orderTotal)) {
      throw new FinancialPostingError(
        "Vendor order allocations do not reconcile with the order total."
      );
    }

    const allocationEntries = [
      ...vendorEntries,
      ...(commissionTotal.gt(0)
        ? [
            {
              accountCode: COMMISSION_REVENUE_ACCOUNT,
              debit: commissionTotal,
              description: `Refund marketplace commission reversal — ${order.orderNumber}`,
              orderId: order.id,
            },
          ]
        : []),
      ...(orderShipping.gt(0)
        ? [
            {
              accountCode: SHIPPING_REVENUE_ACCOUNT,
              debit: orderShipping,
              description: `Refund shipping revenue reversal — ${order.orderNumber}`,
              orderId: order.id,
            },
          ]
        : []),
      {
        accountCode: ORDER_CLEARING_ACCOUNT,
        credit: orderTotal,
        description: `Refund order clearing reversal — ${order.orderNumber}`,
        orderId: order.id,
      },
    ];

    if (!vendorNetTotal.plus(commissionTotal).plus(orderShipping).eq(orderTotal)) {
      throw new FinancialPostingError(
        "Refund allocation does not reconcile with the order total."
      );
    }

    const allocationReference = `REFUND-ALLOCATION-${order.id}`;

    const allocationTransaction = await postFinancialTransaction({
      reference: allocationReference,
      type: FinancialTransactionType.REFUND,
      amount: orderTotal,
      currency: "NGN",
      description: `Marketplace allocation reversal for refund — ${order.orderNumber}`,
      orderId: order.id,
      externalReference: `REFUND-ALLOCATION-${order.paymentIntentId}`,
      idempotencyKey: `REFUND-ALLOCATION-${order.id}`,
      occurredAt: input.occurredAt,
      actorUserId: input.actorUserId,
      entries: allocationEntries,
      metadata: {
        refundStage: "allocation-reversal",
        orderNumber: order.orderNumber,
      },
    });

    assertExistingTransaction(allocationTransaction, {
      reference: allocationReference,
      type: FinancialTransactionType.REFUND,
      amount: orderTotal,
      orderId: order.id,
    });

    const paymentReference = `REFUND-PAYMENT-${order.id}`;

    const paymentTransaction = await postFinancialTransaction({
      reference: paymentReference,
      type: FinancialTransactionType.REFUND,
      amount: orderTotal,
      currency: "NGN",
      description: `Customer refund movement to Paystack — ${order.orderNumber}`,
      orderId: order.id,
      userId: undefined,
      externalReference: `REFUND-PAYMENT-${order.paymentIntentId}`,
      idempotencyKey: `REFUND-PAYMENT-${order.id}`,
      occurredAt: input.occurredAt,
      actorUserId: input.actorUserId,
      entries: [
        {
          accountCode: ORDER_CLEARING_ACCOUNT,
          debit: orderTotal,
          description: `Refund customer order clearing — ${order.orderNumber}`,
          orderId: order.id,
        },
        {
          accountCode: PAYSTACK_CLEARING_ACCOUNT,
          credit: orderTotal,
          description: `Refund Paystack clearing — ${order.orderNumber}`,
          orderId: order.id,
        },
      ],
      metadata: {
        refundStage: "provider-refund-movement",
        orderNumber: order.orderNumber,
        paymentReference: order.paymentIntentId,
      },
    });

    assertExistingTransaction(paymentTransaction, {
      reference: paymentReference,
      type: FinancialTransactionType.REFUND,
      amount: orderTotal,
      orderId: order.id,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: orderTotal,
      allocationTransactionId: allocationTransaction.id,
      paymentTransactionId: paymentTransaction.id,
      paymentReference: order.paymentIntentId,
    };
  }
}
