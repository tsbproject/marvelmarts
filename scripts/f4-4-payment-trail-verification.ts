import { Prisma } from "@prisma/client";

import prisma from "@/app/lib/prisma";

const ORDER_ID = "cmu5oz45v001sq8vjg44t2wq7";
const VENDOR_ID = "cmn803wni000a8svjstuwe25s";

function decimal(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return new Prisma.Decimal(value ?? 0);
}

async function main() {
  console.log(`
==============================================
F4.4 PAYMENT TRAIL VERIFICATION
READ-ONLY - NO DATABASE WRITES
==============================================
`);

  const order = await prisma.order.findUnique({
    where: {
      id: ORDER_ID,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentIntentId: true,
      subtotal: true,
      shipping: true,
      total: true,
      createdAt: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${ORDER_ID} was not found.`);
  }

  const vendorOrder = await prisma.vendorOrder.findUnique({
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
      status: true,
      merchandiseSubtotal: true,
      shipping: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
    },
  });

  if (!vendorOrder) {
    throw new Error(
      `VendorOrder for vendor ${VENDOR_ID} was not found.`
    );
  }

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

  const financialLedgerEntries =
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

  const payableAccount =
    await prisma.financialAccount.findUnique({
      where: {
        code: "2000",
      },
      select: {
        id: true,
        code: true,
        name: true,
        currency: true,
        isActive: true,
      },
    });

  const payableEntries = payableAccount
    ? financialLedgerEntries.filter(
        (entry) => entry.accountId === payableAccount.id
      )
    : [];

  const payableCredits = payableEntries.reduce(
    (total, entry) =>
      total.plus(decimal(entry.credit)),
    new Prisma.Decimal(0)
  );

  const payableDebits = payableEntries.reduce(
    (total, entry) =>
      total.plus(decimal(entry.debit)),
    new Prisma.Decimal(0)
  );

  const payableNet = payableCredits.minus(payableDebits);

  const orderTotal = decimal(order.total);
  const orderSubtotal = decimal(order.subtotal);
  const orderShipping = decimal(order.shipping);

  const vendorMerchandise = decimal(
    vendorOrder.merchandiseSubtotal
  );

  const commission = decimal(
    vendorOrder.commissionAmount
  );

  const vendorNet = decimal(
    vendorOrder.vendorNet
  );

  console.log("ORDER");
  console.log("----------------------------------------------");
  console.log(`ID:               ${order.id}`);
  console.log(`Order Number:     ${order.orderNumber}`);
  console.log(`Status:           ${order.status}`);
  console.log(`Payment Status:   ${order.paymentStatus}`);
  console.log(
    `Payment Ref:      ${order.paymentIntentId ?? "NONE"}`
  );
  console.log(
    `Subtotal:         ₦${orderSubtotal.toFixed(2)}`
  );
  console.log(
    `Shipping:         ₦${orderShipping.toFixed(2)}`
  );
  console.log(
    `Total:            ₦${orderTotal.toFixed(2)}`
  );
  console.log(`Created:          ${order.createdAt.toISOString()}`);

  console.log("\nVENDOR ORDER");
  console.log("----------------------------------------------");
  console.log(`ID:               ${vendorOrder.id}`);
  console.log(`Vendor:           ${vendorOrder.vendorProfileId}`);
  console.log(`Status:           ${vendorOrder.status}`);
  console.log(
    `Merchandise:      ₦${vendorMerchandise.toFixed(2)}`
  );
  console.log(
    `Shipping:         ₦${decimal(vendorOrder.shipping).toFixed(2)}`
  );
  console.log(
    `Total:            ₦${decimal(vendorOrder.total).toFixed(2)}`
  );
  console.log(
    `Commission Rate:  ${vendorOrder.commissionRate ?? "NONE"}`
  );
  console.log(
    `Commission:       ₦${commission.toFixed(2)}`
  );
  console.log(
    `Vendor Net:       ₦${vendorNet.toFixed(2)}`
  );

  console.log("\nLEGACY MARKETPLACE TRANSACTION");
  console.log("----------------------------------------------");

  if (!marketplaceTransaction) {
    console.log("NONE");
  } else {
    console.log(`ID:               ${marketplaceTransaction.id}`);
    console.log(
      `Gross Amount:     ₦${decimal(
        marketplaceTransaction.grossAmount
      ).toFixed(2)}`
    );
    console.log(
      `Platform Fee:     ₦${decimal(
        marketplaceTransaction.platformFee
      ).toFixed(2)}`
    );
    console.log(
      `Net Amount:       ₦${decimal(
        marketplaceTransaction.netAmount
      ).toFixed(2)}`
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

  console.log("\nFINANCIAL TRANSACTIONS");
  console.log("----------------------------------------------");

  if (financialTransactions.length === 0) {
    console.log("NONE");
  } else {
    console.dir(financialTransactions, {
      depth: null,
    });
  }

  console.log("\nFINANCIAL LEDGER ENTRIES");
  console.log("----------------------------------------------");

  if (financialLedgerEntries.length === 0) {
    console.log("NONE");
  } else {
    console.dir(financialLedgerEntries, {
      depth: null,
    });
  }

  console.log("\nVENDOR PAYABLE ACCOUNT");
  console.log("----------------------------------------------");

  if (!payableAccount) {
    console.log("Account 2000 NOT FOUND");
  } else {
    console.log(`Account:           ${payableAccount.code}`);
    console.log(`Name:              ${payableAccount.name}`);
    console.log(`Currency:          ${payableAccount.currency}`);
    console.log(`Active:            ${payableAccount.isActive}`);
    console.log(
      `Credits:           ₦${payableCredits.toFixed(2)}`
    );
    console.log(
      `Debits:            ₦${payableDebits.toFixed(2)}`
    );
    console.log(
      `Net Payable:       ₦${payableNet.toFixed(2)}`
    );
  }

  console.log("\nPAYMENT TRAIL ASSESSMENT");
  console.log("----------------------------------------------");

  console.log(
    `Payment status true:        ${order.paymentStatus === true}`
  );

  console.log(
    `Payment reference present:  ${Boolean(order.paymentIntentId)}`
  );

  console.log(
    `Order total valid:          ${orderTotal.gt(0)}`
  );

  console.log(
    `Vendor net valid:           ${vendorNet.gt(0)}`
  );

  console.log(
    `Legacy transaction exists:  ${Boolean(marketplaceTransaction)}`
  );

  console.log(
    `Legacy transaction SUCCESS: ${
      marketplaceTransaction?.status === "SUCCESS"
    }`
  );

  console.log(
    `Legacy net matches VendorOrder: ${
      marketplaceTransaction
        ? decimal(marketplaceTransaction.netAmount).eq(
            vendorNet
          )
        : false
    }`
  );

  console.log(
    `Legacy gross matches Order: ${
      marketplaceTransaction
        ? decimal(marketplaceTransaction.grossAmount).eq(
            orderTotal
          )
        : false
    }`
  );

  console.log(
    `Financial transactions missing: ${
      financialTransactions.length === 0
    }`
  );

  console.log(
    `Vendor payable missing: ${payableNet.eq(0)}`
  );

  console.log("\nEXPECTED HISTORICAL SALE POSTING");
  console.log("----------------------------------------------");

  console.log(
    `Customer payment:   Dr 1010 ₦${orderTotal.toFixed(2)}`
  );

  console.log(
    `                    Cr 1100 ₦${orderTotal.toFixed(2)}`
  );

  console.log(
    `Order allocation:   Dr 1100 ₦${orderTotal.toFixed(2)}`
  );

  console.log(
    `                    Cr 2000 ₦${vendorNet.toFixed(2)}`
  );

  console.log(
    `                    Cr 4000 ₦${commission.toFixed(2)}`
  );

  if (orderShipping.gt(0)) {
    console.log(
      `                    Cr 4010 ₦${orderShipping.toFixed(2)}`
    );
  }

  console.log("\n==============================================");
  console.log("END OF PAYMENT TRAIL VERIFICATION");
  console.log("NO DATABASE WRITES WERE PERFORMED");
  console.log("==============================================");
}

main()
  .catch((error) => {
    console.error("\nVERIFICATION FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });