import prisma from "@/app/lib/prisma";
import MarketplaceSalesService from "@/app/lib/services/finance/marketplace-sales.service";

async function main() {
  const orderNumber = "MARVEL-2026-440709";

  console.log(`
==============================================
F4.4 HISTORICAL FINANCIAL MIGRATION
ONE ORDER ONLY
==============================================
`);

  const order = await prisma.order.findUnique({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      status: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderNumber} was not found.`);
  }

  console.log("TARGET ORDER");
  console.log("----------------------------------------------");
  console.log(`ID:       ${order.id}`);
  console.log(`Number:   ${order.orderNumber}`);
  console.log(`Status:   ${order.status}`);
  console.log(`Paid:     ${order.paymentStatus}`);

  if (!order.paymentStatus) {
    throw new Error(
      "Migration stopped: order is not marked as paid."
    );
  }

  const existing =
    await prisma.financialTransaction.count({
      where: {
        orderId: order.id,
      },
    });

  console.log(
    `Existing financial transactions: ${existing}`
  );

  if (existing > 0) {
    throw new Error(
      "Migration stopped: financial transactions already exist for this order."
    );
  }

  console.log("\nPosting through MarketplaceSalesService...");

  const result =
    await MarketplaceSalesService.recordSuccessfulOrderSale(
      order.id
    );

  console.log("\nMIGRATION RESULT");
  console.log("----------------------------------------------");
  console.log(`Order:              ${result.orderNumber}`);
  console.log(
    `Total:              ₦${result.total.toFixed(2)}`
  );
  console.log(
    `Merchandise:        ₦${result.merchandiseSubtotal.toFixed(2)}`
  );
  console.log(
    `Shipping:           ₦${result.shipping.toFixed(2)}`
  );
  console.log(
    `Commission:         ₦${result.commission.toFixed(2)}`
  );
  console.log(
    `Vendor Net:         ₦${result.vendorNet.toFixed(2)}`
  );
  console.log(
    `Payment Transaction:   ${result.paymentTransactionId}`
  );
  console.log(
    `Allocation Transaction: ${result.allocationTransactionId}`
  );

  console.log(`
==============================================
MIGRATION COMPLETED
==============================================
`);
}

main()
  .catch((error) => {
    console.error("\nMIGRATION FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });