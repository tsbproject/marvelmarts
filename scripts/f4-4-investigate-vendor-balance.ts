import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

const VENDOR_PROFILE_ID = "cmn803wni000a8svjstuwe25s";

function money(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return new Prisma.Decimal(value ?? 0).toFixed(2);
}

async function main() {
  console.log("==============================================");
  console.log("F4.4 VENDOR BALANCE INVESTIGATION");
  console.log("==============================================");
  console.log(`Vendor Profile ID: ${VENDOR_PROFILE_ID}`);
  console.log("READ-ONLY: No database writes will be performed.");
  console.log();

  // ------------------------------------------------------------
  // 1. Current VendorProfile balance
  // ------------------------------------------------------------

  const vendor = await prisma.vendorProfile.findUnique({
    where: {
      id: VENDOR_PROFILE_ID,
    },
    select: {
      id: true,
      userId: true,
      balance: true,
    },
  });

  if (!vendor) {
    throw new Error(
      `VendorProfile ${VENDOR_PROFILE_ID} was not found.`
    );
  }

  console.log("CURRENT VENDOR BALANCE");
  console.log("----------------------------------------------");
  console.log(`Vendor ID:      ${vendor.id}`);
  console.log(`User ID:        ${vendor.userId}`);
  console.log(`Balance:        ₦${money(vendor.balance)}`);
  console.log();

  // ------------------------------------------------------------
  // 2. VendorOrders
  // ------------------------------------------------------------

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      vendorProfileId: VENDOR_PROFILE_ID,
    },
    select: {
      id: true,
      orderId: true,
      merchandiseSubtotal: true,
      shipping: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
      status: true,
      createdAt: true,
      order: {
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log("VENDOR ORDERS");
  console.log("----------------------------------------------");
  console.log(`Count: ${vendorOrders.length}`);
  console.log();

  let vendorOrderNetTotal = new Prisma.Decimal(0);

  for (const item of vendorOrders) {
    const vendorNet = new Prisma.Decimal(item.vendorNet ?? 0);

    vendorOrderNetTotal = vendorOrderNetTotal.plus(vendorNet);

    console.log(
      `${item.order.orderNumber} | ` +
        `VendorOrder=${item.id} | ` +
        `Status=${item.status}`
    );

    console.log(
      `  Merchandise: ₦${money(item.merchandiseSubtotal)}`
    );
    console.log(`  Shipping:    ₦${money(item.shipping)}`);
    console.log(`  Total:       ₦${money(item.total)}`);
    console.log(`  Commission:  ₦${money(item.commissionAmount)}`);
    console.log(`  Vendor Net:  ₦${money(item.vendorNet)}`);
    console.log(
      `  Payment:     ${item.order.paymentStatus}`
    );
    console.log();
  }

  console.log(
    `TOTAL VENDOR ORDER NET: ₦${money(vendorOrderNetTotal)}`
  );
  console.log();

  // ------------------------------------------------------------
  // 3. Legacy MarketplaceTransactions
  // ------------------------------------------------------------

  const marketplaceTransactions =
    await prisma.marketplaceTransaction.findMany({
      where: {
        vendorProfileId: VENDOR_PROFILE_ID,
      },
      select: {
        id: true,
        orderId: true,
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        commissionRate: true,
        vendorTier: true,
        status: true,
        reference: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  console.log("LEGACY MARKETPLACE TRANSACTIONS");
  console.log("----------------------------------------------");
  console.log(`Count: ${marketplaceTransactions.length}`);
  console.log();

  let marketplaceNetTotal = new Prisma.Decimal(0);

  for (const transaction of marketplaceTransactions) {
    const net = new Prisma.Decimal(transaction.netAmount);

    marketplaceNetTotal = marketplaceNetTotal.plus(net);

    const matchingVendorOrder = vendorOrders.find(
      (item) => item.orderId === transaction.orderId
    );

    const orderNumber =
      matchingVendorOrder?.order.orderNumber ??
      transaction.orderId;

    console.log(
      `${orderNumber} | ` +
        `OrderID=${transaction.orderId} | ` +
        `Status=${transaction.status}`
    );

    console.log(
      `  Gross:        ₦${money(transaction.grossAmount)}`
    );
    console.log(
      `  Platform Fee: ₦${money(transaction.platformFee)}`
    );
    console.log(
      `  Net:          ₦${money(transaction.netAmount)}`
    );
    console.log(
      `  Commission:   ${transaction.commissionRate}`
    );
    console.log(`  Tier:         ${transaction.vendorTier}`);
    console.log(`  Reference:    ${transaction.reference}`);
    console.log();
  }

  console.log(
    `TOTAL LEGACY MARKETPLACE NET: ₦${money(
      marketplaceNetTotal
    )}`
  );
  console.log();

  // ------------------------------------------------------------
  // 4. Payout history
  // ------------------------------------------------------------

  const payouts = await prisma.payout.findMany({
    where: {
      vendorProfileId: VENDOR_PROFILE_ID,
    },
    select: {
      id: true,
      amount: true,
      status: true,
      reference: true,
      vendorId: true,
      createdAt: true,
      processedAt: true,
      adminRemarks: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log("PAYOUT HISTORY");
  console.log("----------------------------------------------");
  console.log(`Count: ${payouts.length}`);
  console.log();

  let payoutTotal = new Prisma.Decimal(0);

  for (const payout of payouts) {
    payoutTotal = payoutTotal.plus(payout.amount);

    console.log(
      `${payout.reference} | ` +
        `₦${money(payout.amount)} | ` +
        `Status=${payout.status}`
    );

    console.log(
      `  Created:    ${payout.createdAt.toISOString()}`
    );

    console.log(
      `  Processed:  ${
        payout.processedAt
          ? payout.processedAt.toISOString()
          : "null"
      }`
    );

    console.log();
  }

  console.log(
    `TOTAL PAYOUT AMOUNT: ₦${money(payoutTotal)}`
  );
  console.log();

  // ------------------------------------------------------------
  // 5. Withdrawal history
  // ------------------------------------------------------------

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      vendorProfileId: VENDOR_PROFILE_ID,
    },
    select: {
      id: true,
      amount: true,
      status: true,
      reference: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log("WITHDRAWAL HISTORY");
  console.log("----------------------------------------------");
  console.log(`Count: ${withdrawals.length}`);
  console.log();

  let withdrawalTotal = new Prisma.Decimal(0);

  for (const withdrawal of withdrawals) {
    withdrawalTotal = withdrawalTotal.plus(withdrawal.amount);

    console.log(
      `${withdrawal.reference} | ` +
        `₦${money(withdrawal.amount)} | ` +
        `Status=${withdrawal.status}`
    );
  }

  console.log();

  console.log(
    `TOTAL WITHDRAWAL AMOUNT: ₦${money(withdrawalTotal)}`
  );
  console.log();

  // ------------------------------------------------------------
  // 6. New Financial Ledger Vendor Payable
  // ------------------------------------------------------------

  const payableEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        vendorProfileId: VENDOR_PROFILE_ID,
        account: {
          code: "2000",
        },
      },
      select: {
        id: true,
        transactionId: true,
        orderId: true,
        debit: true,
        credit: true,
        createdAt: true,
        transaction: {
          select: {
            reference: true,
            type: true,
            status: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  console.log("FINANCIAL LEDGER — VENDOR PAYABLE (2000)");
  console.log("----------------------------------------------");
  console.log(`Count: ${payableEntries.length}`);
  console.log();

  let payableCredits = new Prisma.Decimal(0);
  let payableDebits = new Prisma.Decimal(0);

  for (const entry of payableEntries) {
    payableCredits = payableCredits.plus(entry.credit ?? 0);
    payableDebits = payableDebits.plus(entry.debit ?? 0);

    console.log(
      `${entry.transaction.reference} | ` +
        `Debit ₦${money(entry.debit)} | ` +
        `Credit ₦${money(entry.credit)}`
    );

    console.log(
      `  Order ID: ${entry.orderId ?? "null"}`
    );
  }

  const outstandingPayable =
    payableCredits.minus(payableDebits);

  console.log();
  console.log(
    `Payable Credits:      ₦${money(payableCredits)}`
  );
  console.log(
    `Payable Debits:       ₦${money(payableDebits)}`
  );
  console.log(
    `Outstanding Payable:  ₦${money(outstandingPayable)}`
  );
  console.log();

  // ------------------------------------------------------------
  // 7. Calculate balance differences
  // ------------------------------------------------------------

  const currentBalance = new Prisma.Decimal(vendor.balance);

  const differenceFromLegacyNet =
    currentBalance.minus(marketplaceNetTotal);

  const differenceFromVendorOrders =
    currentBalance.minus(vendorOrderNetTotal);

  console.log("BALANCE ANALYSIS");
  console.log("----------------------------------------------");
  console.log(
    `Current VendorProfile.balance:      ₦${money(
      currentBalance
    )}`
  );
  console.log(
    `VendorOrder vendorNet total:        ₦${money(
      vendorOrderNetTotal
    )}`
  );
  console.log(
    `Legacy MarketplaceTransaction net:  ₦${money(
      marketplaceNetTotal
    )}`
  );
  console.log(
    `Financial Vendor Payable:           ₦${money(
      outstandingPayable
    )}`
  );
  console.log();

  console.log(
    `Balance - VendorOrder Net:           ₦${money(
      differenceFromVendorOrders
    )}`
  );

  console.log(
    `Balance - Legacy Marketplace Net:    ₦${money(
      differenceFromLegacyNet
    )}`
  );

  console.log();

  // ------------------------------------------------------------
  // 8. Per-order comparison
  // ------------------------------------------------------------

  console.log("PER-ORDER COMPARISON");
  console.log("----------------------------------------------");

  const orderIds = new Set<string>();

  for (const order of vendorOrders) {
    orderIds.add(order.orderId);
  }

  for (const transaction of marketplaceTransactions) {
    orderIds.add(transaction.orderId);
  }

  for (const orderId of orderIds) {
    const vendorOrder = vendorOrders.find(
      (item) => item.orderId === orderId
    );

    const marketplaceTransaction =
      marketplaceTransactions.find(
        (item) => item.orderId === orderId
      );

    const orderNumber =
      vendorOrder?.order.orderNumber ??
      orderId;

    console.log(`Order: ${orderNumber}`);
    console.log(`  Order ID:              ${orderId}`);

    console.log(
      `  VendorOrder net:       ₦${money(
        vendorOrder?.vendorNet
      )}`
    );

    console.log(
      `  Marketplace net:       ₦${money(
        marketplaceTransaction?.netAmount
      )}`
    );

    console.log(
      `  Financial payable:     ₦${money(
        payableEntries
          .filter((entry) => entry.orderId === orderId)
          .reduce(
            (total, entry) =>
              total.plus(entry.credit ?? 0).minus(entry.debit ?? 0),
            new Prisma.Decimal(0)
          )
      )}`
    );

    console.log();
  }

  // ------------------------------------------------------------
  // 9. Final diagnostic
  // ------------------------------------------------------------

  console.log("==============================================");
  console.log("DIAGNOSTIC SUMMARY");
  console.log("==============================================");

  console.log(
    `Current balance:             ₦${money(currentBalance)}`
  );

  console.log(
    `VendorOrder net:             ₦${money(
      vendorOrderNetTotal
    )}`
  );

  console.log(
    `Legacy marketplace net:      ₦${money(
      marketplaceNetTotal
    )}`
  );

  console.log(
    `Financial payable:            ₦${money(
      outstandingPayable
    )}`
  );

  console.log(
    `Payouts:                      ₦${money(payoutTotal)}`
  );

  console.log(
    `Withdrawals:                  ₦${money(withdrawalTotal)}`
  );

  console.log();

  console.log(
    `Balance - Marketplace net:   ₦${money(
      differenceFromLegacyNet
    )}`
  );

  console.log(
    `Balance - VendorOrder net:   ₦${money(
      differenceFromVendorOrders
    )}`
  );

  console.log();
  console.log("✅ Investigation completed.");
  console.log("No database writes were performed.");
}

main()
  .catch((error) => {
    console.error();
    console.error("❌ INVESTIGATION FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });