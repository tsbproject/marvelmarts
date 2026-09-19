import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

const ORDER_ID = "cmu5oz45v001sq8vjg44t2wq7";
const VENDOR_PROFILE_ID = "cmn803wni000a8svjstuwe25s";

const EXPECTED = {
  orderTotal: new Prisma.Decimal("360800"),
  vendorNet: new Prisma.Decimal("324720"),
  commission: new Prisma.Decimal("36080"),
  shipping: new Prisma.Decimal("0"),
};

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0).toFixed(2);
}

function assertEqual(
  label: string,
  actual: Prisma.Decimal | number | string | null | undefined,
  expected: Prisma.Decimal
) {
  const actualDecimal = new Prisma.Decimal(actual ?? 0);

  if (!actualDecimal.eq(expected)) {
    throw new Error(
      `${label} mismatch: expected ₦${expected.toFixed(
        2
      )}, got ₦${actualDecimal.toFixed(2)}`
    );
  }
}

async function main() {
  console.log("==============================================");
  console.log("F4.4 FINAL HISTORICAL RECONCILIATION");
  console.log("==============================================");
  console.log(`Order ID: ${ORDER_ID}`);
  console.log(`Vendor Profile ID: ${VENDOR_PROFILE_ID}`);
  console.log("READ-ONLY: No database writes will be performed.");
  console.log();

  // ------------------------------------------------------------
  // 1. Load order and legacy marketplace transaction
  // ------------------------------------------------------------

  const order = await prisma.order.findUnique({
    where: {
      id: ORDER_ID,
    },
    include: {
      vendorOrders: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${ORDER_ID} not found.`);
  }

  const marketplaceTransaction =
    await prisma.marketplaceTransaction.findUnique({
      where: {
        orderId_vendorProfileId: {
          orderId: ORDER_ID,
          vendorProfileId: VENDOR_PROFILE_ID,
        },
      },
    });

  if (!marketplaceTransaction) {
    throw new Error(
      `MarketplaceTransaction not found for order ${ORDER_ID} and vendor ${VENDOR_PROFILE_ID}.`
    );
  }

  console.log("ORDER");
  console.log("----------------------------------------------");
  console.log(`Order Number:     ${order.orderNumber}`);
  console.log(`Status:           ${order.status}`);
  console.log(`Payment Status:   ${order.paymentStatus}`);
  console.log(`Subtotal:         ₦${money(order.subtotal)}`);
  console.log(`Shipping:         ₦${money(order.shipping)}`);
  console.log(`Total:            ₦${money(order.total)}`);
  console.log(`Payment Intent:   ${order.paymentIntentId ?? "null"}`);
  console.log();

  // ------------------------------------------------------------
  // 2. Validate order-level historical values
  // ------------------------------------------------------------

  assertEqual("Order total", order.total, EXPECTED.orderTotal);
  assertEqual("Order shipping", order.shipping, EXPECTED.shipping);

  const orderSubtotal = new Prisma.Decimal(order.subtotal);

  if (!orderSubtotal.plus(order.shipping).eq(order.total)) {
    throw new Error(
      `Order arithmetic mismatch: subtotal + shipping != total.`
    );
  }

  // ------------------------------------------------------------
  // 3. VendorOrder reconciliation
  // ------------------------------------------------------------

  const vendorOrders = order.vendorOrders.filter(
    (vendorOrder) =>
      vendorOrder.vendorProfileId === VENDOR_PROFILE_ID
  );

  if (vendorOrders.length !== 1) {
    throw new Error(
      `Expected exactly 1 VendorOrder for vendor ${VENDOR_PROFILE_ID}, found ${vendorOrders.length}.`
    );
  }

  const vendorOrder = vendorOrders[0];

  console.log("VENDOR ORDER");
  console.log("----------------------------------------------");
  console.log(`VendorOrder ID:   ${vendorOrder.id}`);
  console.log(`Vendor Profile:   ${vendorOrder.vendorProfileId}`);
  console.log(`Status:           ${vendorOrder.status}`);
  console.log(`Merchandise:      ₦${money(vendorOrder.merchandiseSubtotal)}`);
  console.log(`Shipping:         ₦${money(vendorOrder.shipping)}`);
  console.log(`Total:            ₦${money(vendorOrder.total)}`);
  console.log(`Commission Rate:  ${vendorOrder.commissionRate}`);
  console.log(`Commission:       ₦${money(vendorOrder.commissionAmount)}`);
  console.log(`Vendor Net:       ₦${money(vendorOrder.vendorNet)}`);
  console.log();

  assertEqual(
    "VendorOrder total",
    vendorOrder.total,
    EXPECTED.orderTotal
  );

  assertEqual(
    "VendorOrder merchandise",
    vendorOrder.merchandiseSubtotal,
    EXPECTED.orderTotal
  );

  assertEqual(
    "VendorOrder shipping",
    vendorOrder.shipping,
    EXPECTED.shipping
  );

  assertEqual(
    "VendorOrder commission",
    vendorOrder.commissionAmount,
    EXPECTED.commission
  );

  assertEqual(
    "VendorOrder vendorNet",
    vendorOrder.vendorNet,
    EXPECTED.vendorNet
  );

  const vendorMerchandise = new Prisma.Decimal(
    vendorOrder.merchandiseSubtotal
  );

  const vendorShipping = new Prisma.Decimal(vendorOrder.shipping);

  if (!vendorMerchandise.plus(vendorShipping).eq(vendorOrder.total)) {
    throw new Error(
      "VendorOrder arithmetic mismatch: merchandise + shipping != total."
    );
  }

  if (
    !new Prisma.Decimal(vendorOrder.vendorNet ?? 0)
      .plus(vendorOrder.commissionAmount ?? 0)
      .eq(vendorMerchandise)
  ) {
    throw new Error(
      "VendorOrder accounting mismatch: vendorNet + commission != merchandise subtotal."
    );
  }

  // ------------------------------------------------------------
  // 4. Financial transactions
  // ------------------------------------------------------------

  const financialTransactions =
    await prisma.financialTransaction.findMany({
      where: {
        orderId: ORDER_ID,
      },
      include: {
        ledgerEntries: {
          include: {
            account: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  console.log("FINANCIAL TRANSACTIONS");
  console.log("----------------------------------------------");
  console.log(`Count: ${financialTransactions.length}`);
  console.log();

  for (const transaction of financialTransactions) {
    console.log(
      `${transaction.type} | ${transaction.reference} | ${transaction.status} | ₦${money(
        transaction.amount
      )}`
    );

    for (const entry of transaction.ledgerEntries) {
      console.log(
        `  ${entry.account.code} ${entry.account.name} | ` +
          `Debit: ₦${money(entry.debit)} | ` +
          `Credit: ₦${money(entry.credit)}`
      );
    }

    console.log();
  }

  const paymentTransaction = financialTransactions.find(
    (transaction) =>
      transaction.reference === `SALE-PAYMENT-${ORDER_ID}`
  );

  const allocationTransaction = financialTransactions.find(
    (transaction) =>
      transaction.reference === `SALE-ALLOCATION-${ORDER_ID}`
  );

  if (!paymentTransaction) {
    throw new Error("SALE-PAYMENT transaction is missing.");
  }

  if (!allocationTransaction) {
    throw new Error("SALE-ALLOCATION transaction is missing.");
  }

  if (paymentTransaction.status !== "POSTED") {
    throw new Error(
      `SALE-PAYMENT transaction is not POSTED. Status: ${paymentTransaction.status}`
    );
  }

  if (allocationTransaction.status !== "POSTED") {
    throw new Error(
      `SALE-ALLOCATION transaction is not POSTED. Status: ${allocationTransaction.status}`
    );
  }

  assertEqual(
    "Payment transaction amount",
    paymentTransaction.amount,
    EXPECTED.orderTotal
  );

  assertEqual(
    "Allocation transaction amount",
    allocationTransaction.amount,
    EXPECTED.orderTotal
  );

  // ------------------------------------------------------------
  // 5. Ledger reconciliation
  // ------------------------------------------------------------

  const orderLedgerEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        orderId: ORDER_ID,
      },
      include: {
        account: true,
        transaction: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  console.log("ORDER LEDGER");
  console.log("----------------------------------------------");

  for (const entry of orderLedgerEntries) {
    console.log(
      `${entry.transaction.reference} | ` +
        `${entry.account.code} ${entry.account.name} | ` +
        `Debit: ₦${money(entry.debit)} | ` +
        `Credit: ₦${money(entry.credit)}`
    );
  }

  console.log();

  // ------------------------------------------------------------
  // 6. Calculate ledger totals
  // ------------------------------------------------------------

  let paymentDebit1010 = new Prisma.Decimal(0);
  let paymentCredit1100 = new Prisma.Decimal(0);

  let allocationDebit1100 = new Prisma.Decimal(0);
  let vendorPayableCredit = new Prisma.Decimal(0);
  let commissionCredit = new Prisma.Decimal(0);
  let shippingCredit = new Prisma.Decimal(0);

  for (const entry of orderLedgerEntries) {
    const debit = new Prisma.Decimal(entry.debit ?? 0);
    const credit = new Prisma.Decimal(entry.credit ?? 0);

    switch (entry.account.code) {
      case "1010":
        paymentDebit1010 = paymentDebit1010.plus(debit);
        break;

      case "1100":
        paymentCredit1100 = paymentCredit1100.plus(credit);
        allocationDebit1100 = allocationDebit1100.plus(debit);
        break;

      case "2000":
        vendorPayableCredit = vendorPayableCredit.plus(credit);
        break;

      case "4000":
        commissionCredit = commissionCredit.plus(credit);
        break;

      case "4010":
        shippingCredit = shippingCredit.plus(credit);
        break;
    }
  }

  console.log("ACCOUNTING TOTALS");
  console.log("----------------------------------------------");
  console.log(
    `Paystack Clearing debit (1010): ₦${money(paymentDebit1010)}`
  );
  console.log(
    `Order Clearing credit (1100):   ₦${money(paymentCredit1100)}`
  );
  console.log(
    `Order Clearing debit (1100):    ₦${money(allocationDebit1100)}`
  );
  console.log(
    `Vendor Payable credit (2000):   ₦${money(vendorPayableCredit)}`
  );
  console.log(
    `Commission Revenue (4000):      ₦${money(commissionCredit)}`
  );
  console.log(
    `Shipping Revenue (4010):        ₦${money(shippingCredit)}`
  );
  console.log();

  assertEqual(
    "Paystack Clearing debit",
    paymentDebit1010,
    EXPECTED.orderTotal
  );

  assertEqual(
    "Order Clearing credit",
    paymentCredit1100,
    EXPECTED.orderTotal
  );

  assertEqual(
    "Order Clearing debit",
    allocationDebit1100,
    EXPECTED.orderTotal
  );

  assertEqual(
    "Vendor Payable credit",
    vendorPayableCredit,
    EXPECTED.vendorNet
  );

  assertEqual(
    "Commission Revenue credit",
    commissionCredit,
    EXPECTED.commission
  );

  assertEqual(
    "Shipping Revenue credit",
    shippingCredit,
    EXPECTED.shipping
  );

  const allocationCredits = vendorPayableCredit
    .plus(commissionCredit)
    .plus(shippingCredit);

  if (!allocationDebit1100.eq(allocationCredits)) {
    throw new Error(
      `Allocation ledger is unbalanced: debit ₦${money(
        allocationDebit1100
      )} vs credits ₦${money(allocationCredits)}`
    );
  }

  // ------------------------------------------------------------
  // 7. Vendor Payable account reconciliation
  // ------------------------------------------------------------

  const vendorPayableEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        account: {
          code: "2000",
        },
        vendorProfileId: VENDOR_PROFILE_ID,
      },
      include: {
        transaction: true,
        account: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  let vendorPayableCredits = new Prisma.Decimal(0);
  let vendorPayableDebits = new Prisma.Decimal(0);

  for (const entry of vendorPayableEntries) {
    vendorPayableCredits = vendorPayableCredits.plus(
      entry.credit ?? 0
    );

    vendorPayableDebits = vendorPayableDebits.plus(
      entry.debit ?? 0
    );
  }

  const vendorPayableOutstanding =
    vendorPayableCredits.minus(vendorPayableDebits);

  const historicalOrderPayableEntries =
    vendorPayableEntries.filter(
      (entry) => entry.orderId === ORDER_ID
    );

  console.log("VENDOR PAYABLE");
  console.log("----------------------------------------------");
  console.log(
    `All payable credits:       ₦${money(vendorPayableCredits)}`
  );
  console.log(
    `All payable debits:        ₦${money(vendorPayableDebits)}`
  );
  console.log(
    `Outstanding payable:       ₦${money(vendorPayableOutstanding)}`
  );
  console.log(
    `This order payable entries: ${historicalOrderPayableEntries.length}`
  );
  console.log();

  if (historicalOrderPayableEntries.length !== 1) {
    throw new Error(
      `Expected exactly 1 Vendor Payable ledger entry for this order, found ${historicalOrderPayableEntries.length}.`
    );
  }

  assertEqual(
    "Historical vendor payable",
    historicalOrderPayableEntries[0].credit,
    EXPECTED.vendorNet
  );

  // ------------------------------------------------------------
  // 8. Shipping Revenue reconciliation
  // ------------------------------------------------------------

  const shippingRevenueEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        account: {
          code: "4010",
        },
        orderId: ORDER_ID,
      },
      include: {
        transaction: true,
        account: true,
      },
    });

  let orderShippingRevenue = new Prisma.Decimal(0);

  for (const entry of shippingRevenueEntries) {
    orderShippingRevenue = orderShippingRevenue.plus(
      entry.credit ?? 0
    );
  }

  console.log("SHIPPING REVENUE");
  console.log("----------------------------------------------");
  console.log(`Entries: ${shippingRevenueEntries.length}`);
  console.log(`Shipping revenue: ₦${money(orderShippingRevenue)}`);
  console.log();

  if (shippingRevenueEntries.length !== 0) {
    throw new Error(
      `Expected zero Shipping Revenue entries because shipping is ₦0, found ${shippingRevenueEntries.length}.`
    );
  }

  assertEqual(
    "Historical shipping revenue",
    orderShippingRevenue,
    EXPECTED.shipping
  );

  // ------------------------------------------------------------
  // 9. Financial audit logs
  // ------------------------------------------------------------

  const transactionIds = financialTransactions.map(
    (transaction) => transaction.id
  );

  const auditLogs =
    transactionIds.length > 0
      ? await prisma.financialAuditLog.findMany({
          where: {
            transactionId: {
              in: transactionIds,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        })
      : [];

  console.log("FINANCIAL AUDIT LOGS");
  console.log("----------------------------------------------");
  console.log(`Audit log count: ${auditLogs.length}`);

  for (const audit of auditLogs) {
    console.log(
      `${audit.action} | transaction=${audit.transactionId}`
    );
  }

  console.log();

  if (auditLogs.length !== financialTransactions.length) {
    throw new Error(
      `Expected one audit log per financial transaction. Transactions=${financialTransactions.length}, audit logs=${auditLogs.length}.`
    );
  }

  // ------------------------------------------------------------
  // 10. VendorProfile legacy balance
  // ------------------------------------------------------------

  const vendorProfile =
    await prisma.vendorProfile.findUnique({
      where: {
        id: VENDOR_PROFILE_ID,
      },
      select: {
        id: true,
        balance: true,
      },
    });

  if (!vendorProfile) {
    throw new Error(
      `VendorProfile ${VENDOR_PROFILE_ID} not found.`
    );
  }

  console.log("LEGACY VENDOR BALANCE");
  console.log("----------------------------------------------");
  console.log(
    `VendorProfile.balance: ₦${money(vendorProfile.balance)}`
  );
  console.log();

  // This is intentionally informational.
  // We are verifying that the migration did NOT mutate the
  // legacy operational balance.
  if (!new Prisma.Decimal(vendorProfile.balance).eq("365220")) {
    throw new Error(
      `Legacy VendorProfile.balance changed unexpectedly. Expected ₦365220.00, got ₦${money(
        vendorProfile.balance
      )}.`
    );
  }

  // ------------------------------------------------------------
  // 11. Legacy MarketplaceTransaction
  // ------------------------------------------------------------

  console.log("LEGACY MARKETPLACE TRANSACTION");
  console.log("----------------------------------------------");
  console.log(
    `ID:              ${marketplaceTransaction.id}`
  );
  console.log(
    `Gross Amount:    ₦${money(marketplaceTransaction.grossAmount)}`
  );
  console.log(
    `Platform Fee:    ₦${money(marketplaceTransaction.platformFee)}`
  );
  console.log(
    `Net Amount:      ₦${money(marketplaceTransaction.netAmount)}`
  );
  console.log(
    `Commission Rate: ${marketplaceTransaction.commissionRate}`
  );
  console.log(
    `Vendor Tier:     ${marketplaceTransaction.vendorTier}`
  );
  console.log(
    `Status:          ${marketplaceTransaction.status}`
  );
  console.log(
    `Reference:       ${marketplaceTransaction.reference}`
  );
  console.log();

  assertEqual(
    "Legacy gross amount",
    marketplaceTransaction.grossAmount,
    EXPECTED.orderTotal
  );

  assertEqual(
    "Legacy platform fee",
    marketplaceTransaction.platformFee,
    EXPECTED.commission
  );

  assertEqual(
    "Legacy net amount",
    marketplaceTransaction.netAmount,
    EXPECTED.vendorNet
  );

  // ------------------------------------------------------------
  // 12. Final reconciliation
  // ------------------------------------------------------------

  const paymentBalanced =
    paymentDebit1010.eq(paymentCredit1100) &&
    paymentDebit1010.eq(EXPECTED.orderTotal);

  const allocationBalanced =
    allocationDebit1100.eq(
      vendorPayableCredit
        .plus(commissionCredit)
        .plus(shippingCredit)
    );

  const vendorPayableReconciled =
    vendorPayableCredit
      .minus(vendorPayableDebits)
      .gte(EXPECTED.vendorNet);

  const legacyReconciled =
    new Prisma.Decimal(marketplaceTransaction.netAmount).eq(
      EXPECTED.vendorNet
    );

  console.log("==============================================");
  console.log("FINAL RECONCILIATION");
  console.log("==============================================");
  console.log(
    `Financial transaction count: ${financialTransactions.length}`
  );
  console.log(`Audit log count:             ${auditLogs.length}`);
  console.log(
    `Payment posting balanced:    ${paymentBalanced ? "PASS" : "FAIL"}`
  );
  console.log(
    `Allocation balanced:         ${
      allocationBalanced ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Vendor payable reconciled:   ${
      vendorPayableReconciled ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Shipping revenue reconciled: ${
      orderShippingRevenue.eq(EXPECTED.shipping) ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Legacy transaction matches:  ${
      legacyReconciled ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Legacy balance unchanged:    ${
      new Prisma.Decimal(vendorProfile.balance).eq("365220")
        ? "PASS"
        : "FAIL"
    }`
  );
  console.log();

  if (
    financialTransactions.length !== 2 ||
    !paymentBalanced ||
    !allocationBalanced ||
    !vendorPayableReconciled ||
    !orderShippingRevenue.eq(EXPECTED.shipping) ||
    !legacyReconciled
  ) {
    throw new Error(
      "FINAL RECONCILIATION FAILED. Review the output above."
    );
  }

  console.log("✅ F4.4 FINAL HISTORICAL RECONCILIATION PASSED.");
  console.log();
  console.log("No database writes were performed.");
}

main()
  .catch((error) => {
    console.error();
    console.error("❌ RECONCILIATION FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });