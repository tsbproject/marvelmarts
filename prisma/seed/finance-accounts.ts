import { PrismaClient, FinancialAccountSubtype, FinancialAccountType } from "@prisma/client";

const prisma = new PrismaClient();

const accounts = [
  {
    code: "1000",
    name: "MarvelMarts Cash/Bank",
    type: FinancialAccountType.ASSET,
    subtype: FinancialAccountSubtype.BANK,
    description: "MarvelMarts operating cash and bank funds.",
  },
  {
    code: "1010",
    name: "Paystack Clearing",
    type: FinancialAccountType.ASSET,
    subtype: FinancialAccountSubtype.PROCESSOR_CLEARING,
    description: "Funds received through Paystack pending settlement.",
  },
  {
    code: "1020",
    name: "Processor Receivable",
    type: FinancialAccountType.ASSET,
    subtype: FinancialAccountSubtype.PROCESSOR_RECEIVABLE,
    description: "Amounts receivable from payment processors.",
  },
  {
    code: "1100",
    name: "Order Clearing",
    type: FinancialAccountType.CONTROL,
    subtype: FinancialAccountSubtype.ORDER_CLEARING,
    description: "Control account for order-level financial allocation.",
  },
  {
    code: "1110",
    name: "Refund Clearing",
    type: FinancialAccountType.CONTROL,
    subtype: FinancialAccountSubtype.REFUND_CLEARING,
    description: "Control account for customer refund movements.",
  },
  {
    code: "1120",
    name: "Chargeback Clearing",
    type: FinancialAccountType.CONTROL,
    subtype: FinancialAccountSubtype.CHARGEBACK_CLEARING,
    description: "Control account for chargeback movements.",
  },
  {
    code: "2000",
    name: "Vendor Payable",
    type: FinancialAccountType.LIABILITY,
    subtype: FinancialAccountSubtype.VENDOR_PAYABLE,
    description: "Amounts currently owed to vendors.",
  },
  {
    code: "2010",
    name: "Customer Refund Payable",
    type: FinancialAccountType.LIABILITY,
    subtype: FinancialAccountSubtype.CUSTOMER_REFUND_PAYABLE,
    description: "Approved customer refunds awaiting settlement.",
  },
  {
    code: "2020",
    name: "Pending Payouts",
    type: FinancialAccountType.LIABILITY,
    subtype: FinancialAccountSubtype.PAYOUT_PENDING,
    description: "Vendor payouts that are pending settlement.",
  },
  {
    code: "4000",
    name: "Marketplace Commission Revenue",
    type: FinancialAccountType.REVENUE,
    subtype: FinancialAccountSubtype.MARKETPLACE_COMMISSION,
    description: "Revenue earned from marketplace commissions.",
  },
  {
    code: "4010",
    name: "Shipping Revenue",
    type: FinancialAccountType.REVENUE,
    subtype: FinancialAccountSubtype.SHIPPING_REVENUE,
    description: "Customer-paid shipping revenue.",
  },
  {
    code: "4020",
    name: "Boost Revenue",
    type: FinancialAccountType.REVENUE,
    subtype: FinancialAccountSubtype.BOOST_REVENUE,
    description: "Revenue associated with Boost purchases.",
  },
  {
    code: "4090",
    name: "Other Income",
    type: FinancialAccountType.REVENUE,
    subtype: FinancialAccountSubtype.OTHER_INCOME,
    description: "Other approved MarvelMarts income.",
  },
  {
    code: "5000",
    name: "Processing Fees",
    type: FinancialAccountType.EXPENSE,
    subtype: FinancialAccountSubtype.PROCESSING_FEES,
    description: "Actual payment processor fees.",
  },
  {
    code: "5010",
    name: "Delivery Expense",
    type: FinancialAccountType.EXPENSE,
    subtype: FinancialAccountSubtype.DELIVERY_EXPENSE,
    description: "Actual delivery and logistics costs.",
  },
  {
    code: "5090",
    name: "Other Expense",
    type: FinancialAccountType.EXPENSE,
    subtype: FinancialAccountSubtype.OTHER_EXPENSE,
    description: "Other approved MarvelMarts expenses.",
  },
  {
    code: "6000",
    name: "Financial Adjustments",
    type: FinancialAccountType.CONTROL,
    subtype: FinancialAccountSubtype.ADJUSTMENT,
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
        isActive: true,
      },
      create: {
        ...account,
        currency: "NGN",
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${accounts.length} financial accounts.`);
}

main()
  .catch((error) => {
    console.error("Finance account seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
