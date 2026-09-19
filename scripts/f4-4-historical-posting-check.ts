import prisma from "@/app/lib/prisma";

async function main() {
  const orderNumber = "MARVEL-2026-440709";

  console.log(`
==============================================
F4.4 HISTORICAL POSTING CHECK
READ-ONLY - NO DATABASE WRITES
==============================================
`);

  const order = await prisma.order.findUnique({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      shipping: true,
      total: true,
      paymentIntentId: true,
      vendorProfileId: true,
      vendorOrders: {
        select: {
          id: true,
          vendorProfileId: true,
          status: true,
          merchandiseSubtotal: true,
          shipping: true,
          shippingMethod: true,
          total: true,
          commissionRate: true,
          commissionAmount: true,
          vendorNet: true,
        },
      },
    },
  });

  if (!order) {
    console.log(`Order ${orderNumber} was not found.`);
    return;
  }

  console.log("ORDER");
  console.log("----------------------------------------------");
  console.log(`ID:             ${order.id}`);
  console.log(`Order Number:   ${order.orderNumber}`);
  console.log(`Status:         ${order.status}`);
  console.log(`Payment:        ${order.paymentStatus}`);
  console.log(`Payment Ref:    ${order.paymentIntentId ?? "NONE"}`);
  console.log(`Subtotal:       ₦${order.subtotal.toFixed(2)}`);
  console.log(`Shipping:       ₦${order.shipping.toFixed(2)}`);
  console.log(`Total:          ₦${order.total.toFixed(2)}`);

  console.log("\nVENDOR ORDERS");
  console.log("----------------------------------------------");

  for (const vo of order.vendorOrders) {
    console.log(`VendorOrder:       ${vo.id}`);
    console.log(`Vendor:            ${vo.vendorProfileId}`);
    console.log(`Status:            ${vo.status}`);
    console.log(
      `Merchandise:       ₦${vo.merchandiseSubtotal.toFixed(2)}`
    );
    console.log(
      `Shipping:          ₦${vo.shipping.toFixed(2)}`
    );
    console.log(
      `Shipping Method:   ${vo.shippingMethod}`
    );
    console.log(
      `Total:             ₦${vo.total.toFixed(2)}`
    );
    console.log(
      `Commission Rate:   ${vo.commissionRate ?? "NONE"}`
    );
    console.log(
      `Commission:        ₦${vo.commissionAmount?.toFixed(2) ?? "NONE"}`
    );
    console.log(
      `Vendor Net:        ₦${vo.vendorNet?.toFixed(2) ?? "NONE"}`
    );
  }

  console.log("\nLEGACY MARKETPLACE TRANSACTIONS");
  console.log("----------------------------------------------");

  const legacyTransactions =
    await prisma.marketplaceTransaction.findMany({
      where: {
        orderId: order.id,
      },
      select: {
        id: true,
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

  if (legacyTransactions.length === 0) {
    console.log("NONE");
  }

  for (const tx of legacyTransactions) {
    console.log(`ID:               ${tx.id}`);
    console.log(`Vendor:            ${tx.vendorProfileId}`);
    console.log(`Gross:             ₦${tx.grossAmount.toFixed(2)}`);
    console.log(`Platform Fee:     ₦${tx.platformFee.toFixed(2)}`);
    console.log(`Net:               ₦${tx.netAmount.toFixed(2)}`);
    console.log(`Commission Rate:   ${tx.commissionRate}`);
    console.log(`Tier:              ${tx.vendorTier}`);
    console.log(`Status:            ${tx.status}`);
    console.log(`Reference:         ${tx.reference}`);
  }

  console.log("\nNEW FINANCIAL TRANSACTIONS");
  console.log("----------------------------------------------");

  const financialTransactions =
    await prisma.financialTransaction.findMany({
      where: {
        orderId: order.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        ledgerEntries: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

  if (financialTransactions.length === 0) {
    console.log("NONE");
  }

  for (const tx of financialTransactions) {
    console.log(`Transaction:       ${tx.id}`);
    console.log(`Reference:         ${tx.reference}`);
    console.log(`Type:              ${tx.type}`);
    console.log(`Status:            ${tx.status}`);
    console.log(`Amount:            ₦${tx.amount.toFixed(2)}`);

    for (const entry of tx.ledgerEntries) {
      console.log(
        `  ${entry.account.code} ${entry.account.name} | ` +
        `Dr ₦${Number(entry.debit).toFixed(2)} | ` +
        `Cr ₦${Number(entry.credit).toFixed(2)}`
      );
    }
  }

  console.log("\nEXPECTED NEW POSTING");
  console.log("----------------------------------------------");

  const vendorOrder = order.vendorOrders[0];

  if (!vendorOrder) {
    console.log("No VendorOrder found.");
    return;
  }

  const merchandise = Number(vendorOrder.merchandiseSubtotal);
  const shipping = Number(vendorOrder.shipping);
  const total = Number(order.total);
  const commission = Number(vendorOrder.commissionAmount ?? 0);
  const vendorNet = Number(vendorOrder.vendorNet ?? 0);

  console.log(
    `SALE-PAYMENT:       Dr 1010 ₦${total.toFixed(2)}`
  );
  console.log(
    `                   Cr 1100 ₦${total.toFixed(2)}`
  );

  console.log("");

  console.log(
    `SALE-ALLOCATION:   Dr 1100 ₦${total.toFixed(2)}`
  );
  console.log(
    `                   Cr 2000 ₦${vendorNet.toFixed(2)}`
  );
  console.log(
    `                   Cr 4000 ₦${commission.toFixed(2)}`
  );

  if (shipping > 0) {
    console.log(
      `                   Cr 4010 ₦${shipping.toFixed(2)}`
    );
  } else {
    console.log(
      `                   Cr 4010 ₦0.00 (no shipping revenue)`
    );
  }

  console.log("\nRECONCILIATION");
  console.log("----------------------------------------------");

  console.log(
    `Merchandise + shipping = total: ${
      Math.abs(merchandise + shipping - total) < 0.01
    }`
  );

  console.log(
    `Vendor net + commission = merchandise: ${
      Math.abs(vendorNet + commission - merchandise) < 0.01
    }`
  );

  console.log(
    `Legacy transaction exists: ${
      legacyTransactions.length > 0
    }`
  );

  console.log(
    `New financial transactions exist: ${
      financialTransactions.length > 0
    }`
  );

  console.log(`
==============================================
END OF HISTORICAL POSTING CHECK
NO DATABASE WRITES WERE PERFORMED
==============================================
`);
}

main()
  .catch((error) => {
    console.error("\nCHECK FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });