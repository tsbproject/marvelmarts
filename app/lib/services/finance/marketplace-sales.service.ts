import {
  FinancialTransactionType,
  Prisma,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";
import {
  FinancialPostingEntry,
  FinancialPostingError,
  postFinancialTransaction,
} from "@/app/lib/services/finance/financial-posting.service";

const PAYSTACK_CLEARING = "1010";
const ORDER_CLEARING = "1100";
const VENDOR_PAYABLE = "2000";
const MARKETPLACE_COMMISSION_REVENUE = "4000";
const SHIPPING_REVENUE = "4010";
const PROCESSING_FEES = "5000";

function decimal(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return new Prisma.Decimal(value ?? 0);
}

function sum(values: Prisma.Decimal[]) {
  return values.reduce(
    (total, value) => total.plus(value),
    new Prisma.Decimal(0)
  );
}

export class MarketplaceSalesService {
  /**
   * Records the financial accounting for a successfully paid marketplace order.
   *
   * Posting sequence:
   *
   * 1. Customer payment received:
   *    Dr Paystack Clearing
   *    Cr Order Clearing
   *
   * 2. Order allocation:
   *    Dr Order Clearing
   *    Cr Vendor Payable
   *    Cr Marketplace Commission Revenue
   *    Cr Shipping Revenue
   *
   * Vendor-level allocation is derived exclusively from VendorOrder
   * financial snapshots.
   *
   * Shipping is currently stored at the parent Order level, so shipping
   * revenue is allocated from Order.shipping rather than VendorOrder.shipping.
   */
  static async recordSuccessfulOrderSale(
    orderId: string,
    processingFee?: number
  ) {
    if (!orderId) {
      throw new FinancialPostingError(
        "Order ID is required for marketplace sale posting."
      );
    }

    if (
      processingFee != null &&
      (!Number.isFinite(processingFee) ||
        processingFee < 0)
    ) {
      throw new FinancialPostingError(
        "Invalid Paystack processing fee."
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        subtotal: true,
        shipping: true,
        total: true,
        vendorOrders: {
          select: {
            id: true,
            vendorProfileId: true,
            merchandiseSubtotal: true,
            shipping: true,
            total: true,
            commissionRate: true,
            commissionAmount: true,
            vendorNet: true,
          },
        },
      },
    });

    if (!order) {
      throw new FinancialPostingError(
        `Order "${orderId}" does not exist.`
      );
    }

    if (!order.paymentStatus) {
      throw new FinancialPostingError(
        `Order "${order.orderNumber}" has not been paid.`
      );
    }

    if (order.vendorOrders.length === 0) {
      throw new FinancialPostingError(
        `Paid order "${order.orderNumber}" has no vendor allocations.`
      );
    }

    /*
     * Financial snapshots are mandatory for the new accounting path.
     * Historical VendorOrders created before M3 may have null values.
     */
    for (const vendorOrder of order.vendorOrders) {
      if (
        vendorOrder.commissionRate == null ||
        vendorOrder.commissionAmount == null ||
        vendorOrder.vendorNet == null
      ) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" is missing commission financial snapshots.`
        );
      }
    }

    const orderSubtotal = decimal(order.subtotal);
    const orderShipping = decimal(order.shipping);
    const orderTotal = decimal(order.total);

    const vendorMerchandiseTotal = sum(
      order.vendorOrders.map((vendorOrder) =>
        decimal(vendorOrder.merchandiseSubtotal)
      )
    );

    const totalCommission = sum(
      order.vendorOrders.map((vendorOrder) =>
        decimal(vendorOrder.commissionAmount)
      )
    );

    const totalVendorNet = sum(
      order.vendorOrders.map((vendorOrder) =>
        decimal(vendorOrder.vendorNet)
      )
    );

    /*
     * Validate the parent order itself.
     */
    if (!orderSubtotal.plus(orderShipping).eq(orderTotal)) {
      throw new FinancialPostingError(
        `Order "${order.orderNumber}" has an invalid subtotal/shipping/total relationship.`
      );
    }

    /*
     * Vendor merchandise must reconcile exactly to the parent merchandise
     * subtotal.
     */
    if (!vendorMerchandiseTotal.eq(orderSubtotal)) {
      throw new FinancialPostingError(
        `Vendor merchandise allocation does not match order subtotal. ` +
          `Order=${orderSubtotal.toFixed(2)}, ` +
          `VendorAllocations=${vendorMerchandiseTotal.toFixed(2)}.`
      );
    }

    /*
     * Vendor net + commission must equal merchandise subtotal.
     *
     * Shipping is deliberately excluded from this calculation because
     * commission applies only to merchandise.
     */
    if (!totalVendorNet.plus(totalCommission).eq(orderSubtotal)) {
      throw new FinancialPostingError(
        `Vendor net and commission do not reconcile to order merchandise subtotal. ` +
          `Subtotal=${orderSubtotal.toFixed(2)}, ` +
          `VendorNet=${totalVendorNet.toFixed(2)}, ` +
          `Commission=${totalCommission.toFixed(2)}.`
      );
    }

    /*
     * Each VendorOrder must reconcile independently.
     */
    for (const vendorOrder of order.vendorOrders) {
      const merchandiseSubtotal = decimal(
        vendorOrder.merchandiseSubtotal
      );

      const shipping = decimal(vendorOrder.shipping);
      const total = decimal(vendorOrder.total);
      const commissionAmount = decimal(
        vendorOrder.commissionAmount
      );
      const vendorNet = decimal(vendorOrder.vendorNet);

      if (!vendorNet.plus(commissionAmount).eq(merchandiseSubtotal)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" has an invalid vendor net/commission allocation.`
        );
      }

      if (!merchandiseSubtotal.plus(shipping).eq(total)) {
        throw new FinancialPostingError(
          `Vendor order "${vendorOrder.id}" has an invalid merchandise/shipping total.`
        );
      }
    }

    /*
     * ---------------------------------------------------------------
     * 1. CUSTOMER PAYMENT
     * ---------------------------------------------------------------
     *
     * Dr Paystack Clearing
     * Cr Order Clearing
     *
     * The full amount paid by the customer enters Paystack Clearing.
     */
    const paymentTransaction = await postFinancialTransaction({
      reference: `SALE-PAYMENT-${order.id}`,
      idempotencyKey: `SALE-PAYMENT-${order.id}`,
      type: FinancialTransactionType.SALE,
      amount: orderTotal,
      currency: "NGN",
      description: `Customer payment received for order ${order.orderNumber}.`,
      orderId: order.id,
      entries: [
        {
          accountCode: PAYSTACK_CLEARING,
          debit: orderTotal,
          description: `Payment received through Paystack for order ${order.orderNumber}.`,
          orderId: order.id,
        },
        {
          accountCode: ORDER_CLEARING,
          credit: orderTotal,
          description: `Order clearing for customer payment ${order.orderNumber}.`,
          orderId: order.id,
        },
      ],
    });

    /*
     * ---------------------------------------------------------------
     * 2. MARKETPLACE ORDER ALLOCATION
     * ---------------------------------------------------------------
     *
     * Dr Order Clearing
     *
     * Cr Vendor Payable
     * Cr Marketplace Commission Revenue
     * Cr Shipping Revenue
     *
     * Vendor-specific payable entries retain vendorProfileId.
     */
    const allocationEntries: FinancialPostingEntry[] = [
    {
      accountCode: ORDER_CLEARING,
      debit: orderTotal,
      description: `Allocate paid order ${order.orderNumber}.`,
      orderId: order.id,
    },

    ...order.vendorOrders.map((vendorOrder) => ({
      accountCode: VENDOR_PAYABLE,
      credit: decimal(vendorOrder.vendorNet),
      description: `Vendor payable for order ${order.orderNumber}.`,
      vendorProfileId: vendorOrder.vendorProfileId,
      orderId: order.id,
    })),

    {
      accountCode: MARKETPLACE_COMMISSION_REVENUE,
      credit: totalCommission,
      description: `Marketplace commission revenue for order ${order.orderNumber}.`,
      orderId: order.id,
    },

    ...(orderShipping.gt(0)
      ? [
          {
            accountCode: SHIPPING_REVENUE,
            credit: orderShipping,
            description: `Shipping revenue for order ${order.orderNumber}.`,
            orderId: order.id,
          },
        ]
      : []),
  ];

    const allocationTransaction =
      await postFinancialTransaction({
        reference: `SALE-ALLOCATION-${order.id}`,
        idempotencyKey: `SALE-ALLOCATION-${order.id}`,
        type: FinancialTransactionType.SALE,
        amount: orderTotal,
        currency: "NGN",
        description: `Marketplace allocation for order ${order.orderNumber}.`,
        orderId: order.id,
        entries: allocationEntries,
      });

    /*
     * ---------------------------------------------------------------
     * 3. PAYSTACK PROCESSING FEE
     * ---------------------------------------------------------------
     *
     * Marketplace orders absorb the Paystack processing fee.
     *
     * Dr Processing Fees
     * Cr Paystack Clearing
     *
     * The fee comes from the verified Paystack payment flow.
     * This service does not calculate or fetch the fee itself.
     *
     * The deterministic reference makes this posting idempotent.
     */
    let processingFeeTransaction:
      Awaited<
        ReturnType<typeof postFinancialTransaction>
      > | undefined;

    if (
      processingFee != null &&
      processingFee > 0
    ) {
      const feeAmount =
        new Prisma.Decimal(processingFee);

      processingFeeTransaction =
        await postFinancialTransaction({
          reference:
            `PROCESSING-FEE-ORDER-${order.id}`,
          idempotencyKey:
            `PROCESSING-FEE-ORDER-${order.id}`,
          type:
            FinancialTransactionType.PROCESSING_FEE,
          amount: feeAmount,
          currency: "NGN",
          description:
            `Paystack processing fee absorbed by MarvelMarts for order ${order.orderNumber}.`,
          orderId: order.id,
          entries: [
            {
              accountCode: PROCESSING_FEES,
              debit: feeAmount,
              description:
                `Paystack processing fee expense for order ${order.orderNumber}.`,
              orderId: order.id,
            },
            {
              accountCode: PAYSTACK_CLEARING,
              credit: feeAmount,
              description:
                `Paystack processing fee deducted from clearing for order ${order.orderNumber}.`,
              orderId: order.id,
            },
          ],
        });
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: orderTotal,
      merchandiseSubtotal: orderSubtotal,
      shipping: orderShipping,
      commission: totalCommission,
      vendorNet: totalVendorNet,
      paymentTransactionId: paymentTransaction.id,
      allocationTransactionId: allocationTransaction.id,
      processingFee,
      processingFeeTransactionId:
        processingFeeTransaction?.id,
    };
  }
}

export default MarketplaceSalesService;






