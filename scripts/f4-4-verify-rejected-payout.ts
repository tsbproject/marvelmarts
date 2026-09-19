import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EMAIL = "ajongs2007@gmail.com";

async function main() {
  console.log("\n========================================");
  console.log("F4.4 REJECTED PAYOUT VERIFICATION");
  console.log("Vendor:", EMAIL);
  console.log("READ-ONLY");
  console.log("========================================\n");

  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error(`No user found for ${EMAIL}`);
  }

  console.log("USER");
  console.log(user);

  const vendorProfile = await prisma.vendorProfile.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      userId: true,
      balance: true,
      bankName: true,
      accountName: true,
      accountNumber: true,
      isSuspended: true,
    },
  });

  if (!vendorProfile) {
    throw new Error(`No VendorProfile found for user ${user.id}`);
  }

  const vendorProfileId = vendorProfile.id;

  console.log("\nVENDOR PROFILE");
  console.log({
    ...vendorProfile,
    balance: Number(vendorProfile.balance),
  });

  const payouts = await prisma.payout.findMany({
    where: {
      vendorProfileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      amount: true,
      status: true,
      reference: true,
      adminRemarks: true,
      createdAt: true,
      processedAt: true,
    },
  });

  console.log("\nPAYOUT HISTORY");

  if (payouts.length === 0) {
    console.log("No payouts found.");
  } else {
    for (const payout of payouts) {
      console.log({
        ...payout,
        amount: Number(payout.amount),
      });
    }
  }

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      vendorProfileId,
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      merchandiseSubtotal: true,
      shipping: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
    },
  });

  const vendorOrderNet = vendorOrders.reduce(
    (sum, order) => sum + Number(order.vendorNet ?? 0),
    0
  );

  const vendorOrderCommission = vendorOrders.reduce(
    (sum, order) => sum + Number(order.commissionAmount ?? 0),
    0
  );

  console.log("\nVENDOR ORDER TOTALS");
  console.log({
    vendorOrders: vendorOrders.length,
    vendorOrderNet,
    vendorOrderCommission,
  });

  const marketplaceTransactions =
    await prisma.marketplaceTransaction.findMany({
      where: {
        vendorProfileId,
      },
      orderBy: {
        createdAt: "asc",
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
    });

  const marketplaceNet = marketplaceTransactions.reduce(
    (sum, tx) => sum + Number(tx.netAmount),
    0
  );

  console.log("\nLEGACY MARKETPLACE TRANSACTIONS");
  console.log({
    transactions: marketplaceTransactions.length,
    marketplaceNet,
  });

  const vendorPayableEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        account: {
          code: "2000",
        },
        vendorProfileId,
        transaction: {
          status: "POSTED",
        },
      },
      select: {
        debit: true,
        credit: true,
        transactionId: true,
        description: true,
        orderId: true,
      },
    });

  const payableCredits = vendorPayableEntries.reduce(
    (sum, entry) => sum + Number(entry.credit),
    0
  );

  const payableDebits = vendorPayableEntries.reduce(
    (sum, entry) => sum + Number(entry.debit),
    0
  );

  const financialPayable = payableCredits - payableDebits;

  console.log("\nFINANCIAL VENDOR PAYABLE — ACCOUNT 2000");
  console.log({
    entries: vendorPayableEntries.length,
    credits: payableCredits,
    debits: payableDebits,
    outstandingPayable: financialPayable,
  });

  const approvedPayoutAmount = payouts
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const rejectedPayoutAmount = payouts
    .filter((p) => p.status === "REJECTED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingPayoutAmount = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  console.log("\nPAYOUT SUMMARY");
  console.log({
    approvedPayoutAmount,
    rejectedPayoutAmount,
    pendingPayoutAmount,
  });

  console.log("\n========================================");
  console.log("RECONCILIATION");
  console.log("========================================");

  console.log({
    currentVendorBalance: Number(vendorProfile.balance),
    vendorOrderNet,
    marketplaceNet,
    financialVendorPayable: financialPayable,
    approvedPayoutAmount,
    rejectedPayoutAmount,
    pendingPayoutAmount,
  });

  const expectedOperationalBalance =
    vendorOrderNet -
    approvedPayoutAmount -
    pendingPayoutAmount;

  console.log("\nEXPECTED OPERATIONAL BALANCE");
  console.log(expectedOperationalBalance);

  console.log("\nDIFFERENCES");

  console.log({
    balanceVsExpectedOperational:
      Number(vendorProfile.balance) - expectedOperationalBalance,

    vendorOrderNetVsMarketplaceNet:
      vendorOrderNet - marketplaceNet,

    vendorOrderNetVsFinancialPayable:
      vendorOrderNet - financialPayable,

    balanceVsFinancialPayable:
      Number(vendorProfile.balance) - financialPayable,
  });

  console.log("\nREJECTED PAYOUTS");

  const rejected = payouts.filter(
    (p) => p.status === "REJECTED"
  );

  if (rejected.length === 0) {
    console.log("NO REJECTED PAYOUT FOUND.");
  } else {
    for (const payout of rejected) {
      console.log({
        id: payout.id,
        amount: Number(payout.amount),
        reference: payout.reference,
        status: payout.status,
        adminRemarks: payout.adminRemarks,
        createdAt: payout.createdAt,
        processedAt: payout.processedAt,
      });
    }
  }

  console.log("\n========================================");
  console.log("END — NO DATA WAS MODIFIED");
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
