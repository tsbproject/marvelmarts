import prisma from "@/app/lib/prisma";
import {
  FinancialTransactionType,
} from "@prisma/client";
import {
  FinancialPostingError,
  postFinancialTransaction,
} from "@/app/lib/services/finance/financial-posting.service";

async function main() {
  const orderId = "cmu5oz45v001sq8vjg44t2wq7";
  const orderNumber = "MARVEL-2026-440709";

  const vendorProfileId = "cmn803wni000a8svjstuwe25s";

  const orderTotal = "360800";
  const vendorNet = "324720";
  const commission = "36080";

  const reference = `SALE-ALLOCATION-${orderId}`;

  console.log(`
==============================================
F4.4 COMPLETE HISTORICAL ALLOCATION
ONE ORDER ONLY
==============================================
`);

  const existing = await prisma.financialTransaction.findUnique({
    where: {
      reference,
    },
    select: {
      id: true,
      reference: true,
      status: true,
      amount: true,
    },
  });

  if (existing) {
    throw new FinancialPostingError(
      `Allocation already exists: ${existing.id}`
    );
  }

  const paymentTransaction =
    await prisma.financialTransaction.findUnique({
      where: {
        reference: `SALE-PAYMENT-${orderId}`,
      },
      select: {
        id: true,
        status: true,
        amount: true,
      },
    });

  if (!paymentTransaction) {
    throw new FinancialPostingError(
      "Expected SALE-PAYMENT transaction does not exist."
    );
  }

  if (paymentTransaction.status !== "POSTED") {
    throw new FinancialPostingError(
      `Payment transaction is ${paymentTransaction.status}, not POSTED.`
    );
  }

  if (!paymentTransaction.amount.eq(orderTotal)) {
    throw new FinancialPostingError(
      `Payment amount does not match expected order total.`
    );
  }

  console.log("Verified existing payment transaction:");
  console.log(`ID:       ${paymentTransaction.id}`);
  console.log(`Status:   ${paymentTransaction.status}`);
  console.log(
    `Amount:   ₦${paymentTransaction.amount.toFixed(2)}`
  );

  console.log("\nPosting allocation...");

  const allocation =
    await postFinancialTransaction({
      reference,
      idempotencyKey: reference,
      type: FinancialTransactionType.SALE,
      amount: orderTotal,
      currency: "NGN",
      description:
        `Marketplace allocation for order ${orderNumber}.`,
      orderId,
      entries: [
        {
          accountCode: "1100",
          debit: orderTotal,
          description:
            `Allocate paid order ${orderNumber}.`,
          orderId,
        },
        {
          accountCode: "2000",
          credit: vendorNet,
          description:
            `Vendor payable for order ${orderNumber}.`,
          vendorProfileId,
          orderId,
        },
        {
          accountCode: "4000",
          credit: commission,
          description:
            `Marketplace commission revenue for order ${orderNumber}.`,
          orderId,
        },
      ],
    });

  console.log("\nALLOCATION RESULT");
  console.log("----------------------------------------------");
  console.log(`Transaction ID: ${allocation.id}`);
  console.log(`Reference:      ${allocation.reference}`);
  console.log(`Status:         ${allocation.status}`);
  console.log(
    `Amount:         ₦${allocation.amount.toFixed(2)}`
  );

  console.log(`
==============================================
ALLOCATION COMPLETED
==============================================
`);
}

main()
  .catch((error) => {
    console.error("\nALLOCATION FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });