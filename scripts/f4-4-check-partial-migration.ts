import prisma from "@/app/lib/prisma";

async function main() {
  const orderId = "cmu5oz45v001sq8vjg44t2wq7";

  const transactions =
    await prisma.financialTransaction.findMany({
      where: {
        orderId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        reference: true,
        type: true,
        status: true,
        amount: true,
        idempotencyKey: true,
      },
    });

  const ledgerEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        orderId,
      },
      select: {
        id: true,
        transactionId: true,
        accountId: true,
        debit: true,
        credit: true,
        description: true,
      },
    });

  const auditLogs =
    await prisma.financialAuditLog.findMany({
      where: {
        transactionId: {
          in: transactions.map((tx) => tx.id),
        },
      },
      select: {
        id: true,
        transactionId: true,
        action: true,
      },
    });

  console.log(`
==============================================
F4.4 PARTIAL MIGRATION CHECK
READ-ONLY - NO DATABASE WRITES
==============================================
`);

  console.log(
    `Financial transactions: ${transactions.length}`
  );

  for (const tx of transactions) {
    console.log(`
Transaction
----------------------------------------------
ID:              ${tx.id}
Reference:       ${tx.reference}
Type:            ${tx.type}
Status:          ${tx.status}
Amount:          ₦${tx.amount.toFixed(2)}
Idempotency Key: ${tx.idempotencyKey ?? "NONE"}
`);
  }

  console.log(
    `Financial ledger entries: ${ledgerEntries.length}`
  );

  for (const entry of ledgerEntries) {
    console.log({
      id: entry.id,
      transactionId: entry.transactionId,
      debit: entry.debit.toString(),
      credit: entry.credit.toString(),
      description: entry.description,
    });
  }

  console.log(
    `Financial audit logs: ${auditLogs.length}`
  );

  for (const audit of auditLogs) {
    console.log({
      id: audit.id,
      transactionId: audit.transactionId,
      action: audit.action,
    });
  }

  console.log(`
==============================================
END PARTIAL MIGRATION CHECK
NO DATABASE WRITES WERE PERFORMED
==============================================
`);
}

main()
  .catch((error) => {
    console.error("CHECK FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });