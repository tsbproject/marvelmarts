import prisma from "@/app/lib/prisma";

async function main() {
  const orderNumber = "MARVEL-2026-825045";

  console.log(`
==============================================
F4.4 NEW ORDER FINANCIAL CHECK
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

  for (const vendorOrder of order.vendorOrders) {
    console.log(`VendorOrder:       ${vendorOrder.id}`);
    console.log(`Vendor:            ${vendorOrder.vendorProfileId}`);
    console.log(`Status:            ${vendorOrder.status}`);
    console.log(
      `Merchandise:       ₦${vendorOrder.merchandiseSubtotal.toFixed(2)}`
    );
    console.log(
      `Shipping:          ₦${vendorOrder.shipping.toFixed(2)}`
    );
    console.log(
      `Shipping Method:   ${vendorOrder.shippingMethod}`
    );
    console.log(
      `Total:             ₦${vendorOrder.total.toFixed(2)}`
    );
    console.log(
      `Commission:        ₦${vendorOrder.commissionAmount?.toFixed(2) ?? "NONE"}`
    );
    console.log(
      `Vendor Net:        ₦${vendorOrder.vendorNet?.toFixed(2) ?? "NONE"}`
    );
  }

  const transactions =
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
                subtype: true,
              },
            },
          },
        },
      },
    });

  console.log("\nFINANCIAL TRANSACTIONS");
  console.log("----------------------------------------------");

  if (transactions.length === 0) {
    console.log("NONE");
  }

  for (const transaction of transactions) {
    console.log(`Transaction ID:   ${transaction.id}`);
    console.log(`Reference:        ${transaction.reference}`);
    console.log(`Type:             ${transaction.type}`);
    console.log(`Status:           ${transaction.status}`);
    console.log(
      `Amount:           ₦${transaction.amount.toFixed(2)}`
    );
    console.log(`Currency:         ${transaction.currency}`);
    console.log(
      `External Ref:     ${transaction.externalReference ?? "NONE"}`
    );
    console.log(
      `Idempotency Key:  ${transaction.idempotencyKey ?? "NONE"}`
    );

    console.log("Ledger:");

    for (const entry of transaction.ledgerEntries) {
      const debit = Number(entry.debit);
      const credit = Number(entry.credit);

      console.log(
        `  ${entry.account.code} ${entry.account.name} | ` +
        `Debit ₦${debit.toFixed(2)} | ` +
        `Credit ₦${credit.toFixed(2)}`
      );
    }

    console.log("");
  }

  const shippingRevenueAccount =
    await prisma.financialAccount.findUnique({
      where: {
        code: "4010",
      },
      select: {
        id: true,
        code: true,
        name: true,
        subtype: true,
        currency: true,
        isActive: true,
      },
    });

  console.log("\nSHIPPING REVENUE ACCOUNT");
  console.log("----------------------------------------------");

  if (!shippingRevenueAccount) {
    console.log("Account 4010 NOT FOUND.");
  } else {
    console.log(
      `Account:          ${shippingRevenueAccount.code}`
    );
    console.log(
      `Name:             ${shippingRevenueAccount.name}`
    );
    console.log(
      `Subtype:          ${shippingRevenueAccount.subtype}`
    );
    console.log(
      `Currency:         ${shippingRevenueAccount.currency}`
    );
    console.log(
      `Active:            ${shippingRevenueAccount.isActive}`
    );

    const shippingEntries =
      await prisma.financialLedgerEntry.findMany({
        where: {
          accountId: shippingRevenueAccount.id,
          transaction: {
            orderId: order.id,
          },
        },
        select: {
          debit: true,
          credit: true,
          description: true,
        },
      });

    console.log(
      `Entries for this order: ${shippingEntries.length}`
    );

    for (const entry of shippingEntries) {
      console.log(
        `  Debit ₦${Number(entry.debit).toFixed(2)} | ` +
        `Credit ₦${Number(entry.credit).toFixed(2)} | ` +
        `${entry.description}`
      );
    }
  }

  console.log(`
==============================================
END OF FINANCIAL CHECK
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