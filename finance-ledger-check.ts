import "dotenv/config";
import { prisma } from "./app/lib/prisma";

const orderId = "cmu59oomm00ct8gvjfaephpsq";

const transactions = await prisma.financialTransaction.findMany({
  where: {
    orderId,
    reference: {
      startsWith: "SALE-",
    },
  },
  include: {
    ledgerEntries: {
      include: {
        account: true,
      },
    },
  },
  orderBy: {
    createdAt: "asc",
  },
});

console.log(`\nF3.1 TRANSACTIONS FOUND: ${transactions.length}\n`);

for (const tx of transactions) {
  console.log("========================================");
  console.log("TRANSACTION");
  console.log({
    id: tx.id,
    reference: tx.reference,
    type: tx.type,
    status: tx.status,
    amount: tx.amount.toString(),
    currency: tx.currency,
    orderId: tx.orderId,
    idempotencyKey: tx.idempotencyKey,
  });

  console.log("\nLEDGER ENTRIES");

  for (const entry of tx.ledgerEntries) {
    console.log({
      accountCode: entry.account.code,
      accountName: entry.account.name,
      debit: entry.debit.toString(),
      credit: entry.credit.toString(),
      vendorProfileId: entry.vendorProfileId,
      orderId: entry.orderId,
    });
  }
}

const audits = await prisma.financialAuditLog.findMany({
  where: {
    transactionId: {
      in: transactions.map((tx) => tx.id),
    },
  },
  orderBy: {
    createdAt: "asc",
  },
});

console.log("\n========================================");
console.log(`AUDIT LOGS FOUND: ${audits.length}`);

for (const audit of audits) {
  console.log({
    transactionId: audit.transactionId,
    action: audit.action,
  });
}

await prisma.$disconnect();
