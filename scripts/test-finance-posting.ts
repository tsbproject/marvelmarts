import {
  FinancialTransactionType,
  Prisma,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";
import postFinancialTransaction, {
  FinancialPostingError,
} from "@/app/lib/services/finance/financial-posting.service";

async function main() {
  const reference = `FIN-ENGINE-TEST-${Date.now()}`;
  const amount = new Prisma.Decimal("100000.00");

  console.log("=== FINANCE POSTING ENGINE TEST ===");
  console.log(`Reference: ${reference}`);

  console.log("\n[1] Testing valid balanced transaction...");

  const transaction = await postFinancialTransaction({
    reference,
    type: FinancialTransactionType.SALE,
    amount,
    description: "Finance posting engine test",
    idempotencyKey: `${reference}-IDEMPOTENCY`,
    entries: [
      {
        accountCode: "1000",
        debit: amount,
        description: "Test cash receipt",
      },
      {
        accountCode: "1100",
        credit: amount,
        description: "Test order clearing",
      },
    ],
  });

  console.log("PASS: Balanced transaction posted.");
  console.log(`Transaction ID: ${transaction.id}`);
  console.log(`Status: ${transaction.status}`);
  console.log(`Ledger entries: ${transaction.ledgerEntries.length}`);

  if (transaction.ledgerEntries.length !== 2) {
    throw new Error("Expected exactly 2 ledger entries.");
  }

  console.log("\n[2] Testing idempotency...");

  const duplicate = await postFinancialTransaction({
    reference,
    type: FinancialTransactionType.SALE,
    amount,
    description: "Duplicate attempt",
    idempotencyKey: `${reference}-IDEMPOTENCY`,
    entries: [
      {
        accountCode: "1000",
        debit: amount,
      },
      {
        accountCode: "1100",
        credit: amount,
      },
    ],
  });

  if (duplicate.id !== transaction.id) {
    throw new Error("Idempotency test failed: a new transaction was created.");
  }

  console.log("PASS: Duplicate posting returned the original transaction.");

  console.log("\n[3] Testing unbalanced transaction rejection...");

  try {
    await postFinancialTransaction({
      reference: `${reference}-UNBALANCED`,
      type: FinancialTransactionType.SALE,
      amount,
      entries: [
        {
          accountCode: "1000",
          debit: amount,
        },
        {
          accountCode: "1100",
          credit: "99999.99",
        },
      ],
    });

    throw new Error("Unbalanced transaction was incorrectly accepted.");
  } catch (error) {
    if (!(error instanceof FinancialPostingError)) {
      throw error;
    }

    console.log("PASS: Unbalanced transaction rejected.");
  }

  console.log("\n[4] Testing debit + credit on same entry rejection...");

  try {
    await postFinancialTransaction({
      reference: `${reference}-BOTH-SIDES`,
      type: FinancialTransactionType.SALE,
      amount,
      entries: [
        {
          accountCode: "1000",
          debit: amount,
          credit: "1.00",
        },
        {
          accountCode: "1100",
          credit: amount,
        },
      ],
    });

    throw new Error("Invalid ledger entry was incorrectly accepted.");
  } catch (error) {
    if (!(error instanceof FinancialPostingError)) {
      throw error;
    }

    console.log("PASS: Entry containing both debit and credit rejected.");
  }

  console.log("\n[5] Testing missing account rejection...");

  try {
    await postFinancialTransaction({
      reference: `${reference}-MISSING-ACCOUNT`,
      type: FinancialTransactionType.SALE,
      amount,
      entries: [
        {
          accountCode: "999999",
          debit: amount,
        },
        {
          accountCode: "1100",
          credit: amount,
        },
      ],
    });

    throw new Error("Missing account was incorrectly accepted.");
  } catch (error) {
    if (!(error instanceof FinancialPostingError)) {
      throw error;
    }

    console.log("PASS: Missing financial account rejected.");
  }

  console.log("\n[6] Verifying persisted transaction, ledger entries and audit log...");

  const persisted = await prisma.financialTransaction.findUnique({
    where: {
      id: transaction.id,
    },
    include: {
      ledgerEntries: {
        include: {
          account: true,
        },
      },
    },
  });

  if (!persisted) {
    throw new Error("Persisted financial transaction was not found.");
  }

  const auditLog = await prisma.financialAuditLog.findFirst({
    where: {
      transactionId: transaction.id,
      action: "POSTED",
    },
  });

  if (!auditLog) {
    throw new Error("POSTED audit log was not created.");
  }

  console.log("PASS: Financial transaction persisted.");
  console.log("PASS: Ledger entries persisted.");
  console.log("PASS: POSTED audit log persisted.");

  console.log("\n=== FINANCE ENGINE TEST PASSED ===");
  console.log(`Transaction: ${persisted.reference}`);
  console.log(`Amount: ₦${persisted.amount.toFixed(2)}`);
  console.log(`Status: ${persisted.status}`);
  console.log(`Ledger entries: ${persisted.ledgerEntries.length}`);
  console.log(`Audit action: ${auditLog.action}`);
}

main()
  .catch((error) => {
    console.error("\n=== FINANCE ENGINE TEST FAILED ===");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
