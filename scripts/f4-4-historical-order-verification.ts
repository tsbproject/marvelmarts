import { Prisma } from "@prisma/client";

import prisma from "@/app/lib/prisma";

const ORDER_ID = "cmu5oz45v001sq8vjg44t2wq7";
const VENDOR_ID = "cmn803wni000a8svjstuwe25s";

async function main() {
  console.log(
    "\n=============================================="
  );

  console.log(
    "F4.4 HISTORICAL ORDER VERIFICATION"
  );

  console.log(
    "READ-ONLY - NO DATABASE WRITES"
  );

  console.log(
    "==============================================\n"
  );

  /**
   * ------------------------------------------------------------
   * 1. Load the historical parent Order
   *
   * Only fields confirmed to exist on the current Order model
   * are selected.
   * ------------------------------------------------------------
   */

  const order = await prisma.order.findUnique({
    where: {
      id: ORDER_ID,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      shipping: true,
      total: true,
      createdAt: true,
    },
  });

  if (!order) {
    throw new Error(
      `Order ${ORDER_ID} was not found.`
    );
  }

  /**
   * ------------------------------------------------------------
   * 2. Load VendorOrder separately
   *
   * The current Prisma schema does not expose VendorOrders
   * through Order.
   * ------------------------------------------------------------
   */

  const vendorOrders =
    await prisma.vendorOrder.findMany({
      where: {
        orderId: ORDER_ID,
        vendorProfileId: VENDOR_ID,
      },
      select: {
        id: true,
        orderId: true,
        vendorProfileId: true,
        status: true,
        merchandiseSubtotal: true,
        shipping: true,
        total: true,
        commissionRate: true,
        commissionAmount: true,
        vendorNet: true,
      },
    });

  /**
   * ------------------------------------------------------------
   * 3. Load the legacy MarketplaceTransaction
   * ------------------------------------------------------------
   */

  const marketplaceTransaction =
    await prisma.marketplaceTransaction.findUnique({
      where: {
        orderId_vendorProfileId: {
          orderId: ORDER_ID,
          vendorProfileId: VENDOR_ID,
        },
      },
      select: {
        id: true,
        orderId: true,
        vendorProfileId: true,
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        commissionRate: true,
        vendorTier: true,
        status: true,
        reference: true,
      },
    });

  /**
   * ------------------------------------------------------------
   * 4. Load all FinancialTransactions linked to the order
   * ------------------------------------------------------------
   */

  const financialTransactions =
    await prisma.financialTransaction.findMany({
      where: {
        orderId: ORDER_ID,
      },
      select: {
        id: true,
        reference: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        externalReference: true,
        idempotencyKey: true,
        vendorProfileId: true,
        occurredAt: true,
      },
      orderBy: {
        occurredAt: "asc",
      },
    });

  /**
   * ------------------------------------------------------------
   * 5. Load all FinancialLedgerEntries linked to the order
   * ------------------------------------------------------------
   */

  const ledgerEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        orderId: ORDER_ID,
      },
      select: {
        id: true,
        transactionId: true,
        accountId: true,
        vendorProfileId: true,
        debit: true,
        credit: true,
        currency: true,
        description: true,
      },
      orderBy: {
        id: "asc",
      },
    });

  /**
   * ------------------------------------------------------------
   * 6. Display parent Order
   * ------------------------------------------------------------
   */

  console.log(
    "ORDER"
  );

  console.log(
    "----------------------------------------------"
  );

  console.log(
    `ID:               ${order.id}`
  );

  console.log(
    `Order Number:     ${order.orderNumber}`
  );

  console.log(
    `Status:           ${order.status}`
  );

  console.log(
    `Payment Status:   ${order.paymentStatus}`
  );

  console.log(
    `Subtotal:         ₦${order.subtotal.toFixed(2)}`
  );

  console.log(
    `Shipping:         ₦${order.shipping.toFixed(2)}`
  );

  console.log(
    `Total:            ₦${order.total.toFixed(2)}`
  );

  console.log(
    `Created:          ${order.createdAt.toISOString()}`
  );

  /**
   * ------------------------------------------------------------
   * 7. Display VendorOrder
   * ------------------------------------------------------------
   */

  console.log(
    "\nVENDOR ORDER"
  );

  console.log(
    "----------------------------------------------"
  );

  if (vendorOrders.length === 0) {
    console.log(
      "No VendorOrder found for the target vendor."
    );
  }

  for (const vendorOrder of vendorOrders) {
    console.log(
      `ID:               ${vendorOrder.id}`
    );

    console.log(
      `Order ID:         ${vendorOrder.orderId}`
    );

    console.log(
      `Vendor:           ${vendorOrder.vendorProfileId}`
    );

    console.log(
      `Status:           ${vendorOrder.status}`
    );

    console.log(
      `Merchandise:      ₦${vendorOrder.merchandiseSubtotal.toFixed(2)}`
    );

    console.log(
      `Shipping:         ₦${vendorOrder.shipping.toFixed(2)}`
    );

    console.log(
      `Total:            ₦${vendorOrder.total.toFixed(2)}`
    );

    console.log(
      `Commission Rate:  ${
        vendorOrder.commissionRate ?? "NULL"
      }`
    );

    console.log(
      `Commission:       ₦${
        vendorOrder.commissionAmount?.toFixed(2) ??
        "NULL"
      }`
    );

    console.log(
      `Vendor Net:       ₦${
        vendorOrder.vendorNet?.toFixed(2) ??
        "NULL"
      }`
    );
  }

  /**
   * ------------------------------------------------------------
   * 8. Display MarketplaceTransaction
   * ------------------------------------------------------------
   */

  console.log(
    "\nMARKETPLACE TRANSACTION"
  );

  console.log(
    "----------------------------------------------"
  );

  if (!marketplaceTransaction) {
    console.log(
      "NOT FOUND"
    );
  } else {
    console.log(
      `ID:               ${marketplaceTransaction.id}`
    );

    console.log(
      `Order ID:         ${marketplaceTransaction.orderId}`
    );

    console.log(
      `Vendor ID:        ${marketplaceTransaction.vendorProfileId}`
    );

    console.log(
      `Gross Amount:     ₦${marketplaceTransaction.grossAmount.toFixed(2)}`
    );

    console.log(
      `Platform Fee:     ₦${marketplaceTransaction.platformFee.toFixed(2)}`
    );

    console.log(
      `Net Amount:       ₦${marketplaceTransaction.netAmount.toFixed(2)}`
    );

    console.log(
      `Commission Rate:  ${marketplaceTransaction.commissionRate}`
    );

    console.log(
      `Vendor Tier:      ${marketplaceTransaction.vendorTier}`
    );

    console.log(
      `Status:           ${marketplaceTransaction.status}`
    );

    console.log(
      `Reference:        ${marketplaceTransaction.reference}`
    );
  }

  /**
   * ------------------------------------------------------------
   * 9. Display FinancialTransactions
   * ------------------------------------------------------------
   */

  console.log(
    "\nFINANCIAL TRANSACTIONS"
  );

  console.log(
    "----------------------------------------------"
  );

  if (financialTransactions.length === 0) {
    console.log(
      "NONE"
    );
  } else {
    for (const transaction of financialTransactions) {
      console.log(
        `ID:               ${transaction.id}`
      );

      console.log(
        `Reference:        ${transaction.reference}`
      );

      console.log(
        `Type:             ${transaction.type}`
      );

      console.log(
        `Status:           ${transaction.status}`
      );

      console.log(
        `Amount:           ₦${transaction.amount.toFixed(2)}`
      );

      console.log(
        `Currency:         ${transaction.currency}`
      );

      console.log(
        `External Ref:     ${
          transaction.externalReference ??
          "NULL"
        }`
      );

      console.log(
        `Idempotency Key:  ${
          transaction.idempotencyKey ??
          "NULL"
        }`
      );

      console.log(
        `Vendor Profile:   ${
          transaction.vendorProfileId ??
          "NULL"
        }`
      );

      console.log(
        `Occurred At:      ${transaction.occurredAt.toISOString()}`
      );

      console.log("");
    }
  }

  /**
   * ------------------------------------------------------------
   * 10. Display FinancialLedgerEntries
   * ------------------------------------------------------------
   */

  console.log(
    "\nORDER FINANCIAL LEDGER ENTRIES"
  );

  console.log(
    "----------------------------------------------"
  );

  if (ledgerEntries.length === 0) {
    console.log(
      "NONE"
    );
  } else {
    for (const entry of ledgerEntries) {
      console.log(
        `ID:               ${entry.id}`
      );

      console.log(
        `Transaction ID:   ${entry.transactionId}`
      );

      console.log(
        `Account ID:       ${entry.accountId}`
      );

      console.log(
        `Vendor Profile:   ${
          entry.vendorProfileId ??
          "NULL"
        }`
      );

      console.log(
        `Debit:            ₦${entry.debit.toFixed(2)}`
      );

      console.log(
        `Credit:           ₦${entry.credit.toFixed(2)}`
      );

      console.log(
        `Currency:         ${entry.currency}`
      );

      console.log(
        `Description:      ${entry.description}`
      );

      console.log("");
    }
  }

  /**
   * ------------------------------------------------------------
   * 11. Explicit reconciliation summary
   * ------------------------------------------------------------
   */

  console.log(
    "\nRECONCILIATION SUMMARY"
  );

  console.log(
    "----------------------------------------------"
  );

  if (vendorOrders.length > 0) {
    const vendorOrder = vendorOrders[0];

    console.log(
      `VendorOrder Net:              ₦${
        vendorOrder.vendorNet?.toFixed(2) ??
        "NULL"
      }`
    );
  }

  if (marketplaceTransaction) {
    console.log(
      `MarketplaceTransaction Net:   ₦${marketplaceTransaction.netAmount.toFixed(2)}`
    );
  }

  if (financialTransactions.length > 0) {
    const financialTotal =
      financialTransactions.reduce(
        (sum, transaction) =>
          sum.plus(transaction.amount),
        new Prisma.Decimal(0)
      );

    console.log(
      `FinancialTransaction Total:   ₦${financialTotal.toFixed(2)}`
    );
  } else {
    console.log(
      "FinancialTransaction Total:   ₦0.00"
    );
  }

  const payableEntries =
    ledgerEntries.filter(
      (entry) =>
        entry.vendorProfileId ===
        VENDOR_ID
    );

  const payableCredits =
    payableEntries.reduce(
      (sum, entry) =>
        sum.plus(entry.credit),
      new Prisma.Decimal(0)
    );

  const payableDebits =
    payableEntries.reduce(
      (sum, entry) =>
        sum.plus(entry.debit),
      new Prisma.Decimal(0)
    );

  console.log(
    `Vendor Payable Credits:       ₦${payableCredits.toFixed(2)}`
  );

  console.log(
    `Vendor Payable Debits:        ₦${payableDebits.toFixed(2)}`
  );

  console.log(
    `Vendor Payable Net:           ₦${payableCredits
      .minus(payableDebits)
      .toFixed(2)}`
  );

  /**
   * ------------------------------------------------------------
   * Footer
   * ------------------------------------------------------------
   */

  console.log(
    "\n=============================================="
  );

  console.log(
    "END OF HISTORICAL VERIFICATION"
  );

  console.log(
    "==============================================\n"
  );
}

main()
  .catch((error) => {
    console.error(
      "\nF4.4 historical verification failed:"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });