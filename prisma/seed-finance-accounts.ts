import "dotenv/config";
import prisma from "../app/lib/prisma";

const accounts = [
  {
    code: "1000",
    name: "MarvelMarts Cash/Bank",
    type: "ASSET" as const,
    subtype: "BANK" as const,
    description: "MarvelMarts operating cash and bank funds.",
  },
  {
    code: "1010",
    name: "Paystack Clearing",
    type: "ASSET" as const,
    subtype: "PROCESSOR_CLEARING" as const,
    description: "Funds received through Paystack pending settlement.",
  },
  {
    code: "1020",
    name: "Processor Receivable",
    type: "ASSET" as const,
    subtype: "PROCESSOR_RECEIVABLE" as const,
    description: "Amounts receivable from payment processors.",
  },
  {
    code: "1100",
    name: "Order Clearing",
    type: "CONTROL" as const,
    subtype: "ORDER_CLEARING" as const,
    description: "Control account for order-level financial allocation.",
  },
  {
    code: "1110",
    name: "Refund Clearing",
    type: "CONTROL" as const,
    subtype: "REFUND_CLEARING" as const,
    description: "Control account for customer refund movements.",
  },
  {
    code: "1120",
    name: "Chargeback Clearing",
    type: "CONTROL" as const,
    subtype: "CHARGEBACK_CLEARING" as const,
    description: "Control account for chargeback movements.",
  },
  {
    code: "2000",
    name: "Vendor Payable",
    type: "LIABILITY" as const,
    subtype: "VENDOR_PAYABLE" as const,
    description: "Amounts currently owed to vendors.",
  },
  {
    code: "2010",
    name: "Customer Refund Payable",
    type: "LIABILITY" as const,
    subtype: "CUSTOMER_REFUND_PAYABLE" as const,
    description: "Approved customer refunds awaiting settlement.",
  },
  {
    code: "2020",
    name: "Pending Payouts",
    type: "LIABILITY" as const,
    subtype: "PAYOUT_PENDING" as const,
    description: "Vendor payouts that are pending settlement.",
  },
  {
    code: "4000",
    name: "Marketplace Commission Revenue",
    type: "REVENUE" as const,
    subtype: "MARKETPLACE_COMMISSION" as const,
    description: "Revenue earned from marketplace commissions.",
  },
  {
    code: "4010",
    name: "Shipping Revenue",
    type: "REVENUE" as const,
    subtype: "SHIPPING_REVENUE" as const,
    description: "Customer-paid shipping revenue.",
  },
  {
    code: "4020",
    name: "Boost Revenue",
    type: "REVENUE" as const,
    subtype: "BOOST_REVENUE" as const,
    description: "Revenue associated with Boost purchases.",
  },
  {
    code: "4090",
    name: "Other Income",
    type: "REVENUE" as const,
    subtype: "OTHER_INCOME" as const,
    description: "Other approved MarvelMarts income.",
  },
  {
    code: "5000",
    name: "Processing Fees",
    type: "EXPENSE" as const,
    subtype: "PROCESSING_FEES" as const,
    description: "Actual payment processor fees.",
  },
  {
    code: "5010",
    name: "Delivery Expense",
    type: "EXPENSE" as const,
    subtype: "DELIVERY_EXPENSE" as const,
    description: "Actual delivery and logistics costs.",
  },
  {
    code: "5090",
    name: "Other Expense",
    type: "EXPENSE" as const,
    subtype: "OTHER_EXPENSE" as const,
    description: "Other approved MarvelMarts expenses.",
  },
  {
    code: "6000",
    name: "Financial Adjustments",
    type: "CONTROL" as const,
    subtype: "ADJUSTMENT" as const,
    description: "Controlled financial adjustments and corrections.",
  },
];

async function main() {
  for (const account of accounts) {
    await prisma.financialAccount.upsert({
      where: {
        code: account.code,
      },
      update: {
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        description: account.description,
        currency: "NGN",
        isActive: true,
      },
      create: {
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        currency: "NGN",
        isActive: true,
        description: account.description,
      },
    });
  }

  console.log(
    `Finance chart of accounts seeded: ${accounts.length} accounts.`
  );
}

main()
  .catch((error) => {
    console.error("Finance chart of accounts seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
