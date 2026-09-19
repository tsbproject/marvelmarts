import prisma from "@/app/lib/prisma";

async function main() {
  const orderId = "cmu5oz45v001sq8vjg44t2wq7";

  const transactions =
    await prisma.financialTransaction.findMany({
      where: {
        orderId,
      },
      select: {
        id: true,
        reference: true,
        status: true,
        amount: true,
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
        debit: true,
        credit: true,
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
F4.4 ROLLBACK VERIFICATION
READ-ONLY
==============================================`);

  console.log(
    `Financial transactions: ${transactions.length}`
  );

  console.log(
    `Financial ledger entries: ${ledgerEntries.length}`
  );

  console.log(
    `Financial audit logs: ${auditLogs.length}`
  );

  if (transactions.length > 0) {
    console.log("\nUNEXPECTED TRANSACTIONS:");

    for (const tx of transactions) {
      console.log({
        id: tx.id,
        reference: tx.reference,
        status: tx.status,
        amount: tx.amount.toString(),
      });
    }
  }

  if (ledgerEntries.length > 0) {
    console.log("\nUNEXPECTED LEDGER ENTRIES:");

    for (const entry of ledgerEntries) {
      console.log({
        id: entry.id,
        transactionId: entry.transactionId,
        debit: entry.debit.toString(),
        credit: entry.credit.toString(),
      });
    }
  }

  console.log(`
==============================================
END ROLLBACK VERIFICATION
==============================================`);
}

main()
  .catch((error) => {
    console.error("VERIFICATION FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });