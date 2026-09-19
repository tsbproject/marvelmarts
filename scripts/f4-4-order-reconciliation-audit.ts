import prisma from "../app/lib/prisma";
import { Prisma } from "@prisma/client";

function decimal(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return new Prisma.Decimal(value ?? 0);
}

function money(
  value: Prisma.Decimal | number | string | null | undefined
) {
  return decimal(value).toFixed(2);
}

async function main() {
  /**
   * ------------------------------------------------------------
   * 1. Load Vendor Payable financial account
   * ------------------------------------------------------------
   */

  const payableAccount = await prisma.financialAccount.findUnique({
    where: {
      code: "2000",
    },
    select: {
      id: true,
      code: true,
      name: true,
      currency: true,
    },
  });

  if (!payableAccount) {
    throw new Error('Financial account "2000" was not found.');
  }

  /**
   * ------------------------------------------------------------
   * 2. Load vendors
   *
   * VendorProfile does not expose a vendorOrders relation in
   * the current Prisma schema, so VendorOrders are loaded
   * separately below.
   * ------------------------------------------------------------
   */

  const vendors = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      userId: true,
      balance: true,
      score: {
        select: {
          tier: true,
          commissionRate: true,
        },
      },
    },
  });

  /**
   * ------------------------------------------------------------
   * 3. Load all VendorOrders
   * ------------------------------------------------------------
   */

  const vendorOrders = await prisma.vendorOrder.findMany({
    select: {
      id: true,
      orderId: true,
      vendorProfileId: true,
      merchandiseSubtotal: true,
      shipping: true,
      total: true,
      commissionRate: true,
      commissionAmount: true,
      vendorNet: true,
      status: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          shipping: true,
          total: true,
        },
      },
    },
  });

  /**
   * ------------------------------------------------------------
   * 4. Group VendorOrders by VendorProfile
   * ------------------------------------------------------------
   */

  const vendorOrdersByVendor = new Map<
    string,
    typeof vendorOrders
  >();

  for (const vendorOrder of vendorOrders) {
    const list =
      vendorOrdersByVendor.get(vendorOrder.vendorProfileId) ?? [];

    list.push(vendorOrder);

    vendorOrdersByVendor.set(
      vendorOrder.vendorProfileId,
      list
    );
  }

  /**
   * ------------------------------------------------------------
   * 5. Load legacy MarketplaceTransactions
   * ------------------------------------------------------------
   */

  const marketplaceTransactions =
    await prisma.marketplaceTransaction.findMany({
      select: {
        id: true,
        orderId: true,
        vendorProfileId: true,
        grossAmount: true,
        platformFee: true,
        netAmount: true,
        commissionRate: true,
        vendorTier: true,
        status: true,
        reference: true,
      },
    });

  /**
   * ------------------------------------------------------------
   * 6. Group MarketplaceTransactions by vendor
   * ------------------------------------------------------------
   */

  const marketplaceByVendor = new Map<
    string,
    typeof marketplaceTransactions
  >();

  for (const tx of marketplaceTransactions) {
    const list =
      marketplaceByVendor.get(tx.vendorProfileId) ?? [];

    list.push(tx);

    marketplaceByVendor.set(
      tx.vendorProfileId,
      list
    );
  }

  /**
   * ------------------------------------------------------------
   * 7. Load Vendor Payable ledger entries
   *
   * Account 2000:
   * Vendor Payable
   *
   * Only POSTED financial transactions are considered.
   * ------------------------------------------------------------
   */

  const ledgerEntries =
    await prisma.financialLedgerEntry.findMany({
      where: {
        accountId: payableAccount.id,
        transaction: {
          status: "POSTED",
        },
      },
      select: {
        vendorProfileId: true,
        debit: true,
        credit: true,
        orderId: true,
        transactionId: true,
        transaction: {
          select: {
            reference: true,
            type: true,
            status: true,
          },
        },
      },
    });

  /**
   * ------------------------------------------------------------
   * 8. Group ledger entries by vendor
   * ------------------------------------------------------------
   */

  const ledgerByVendor = new Map<
    string,
    typeof ledgerEntries
  >();

  for (const entry of ledgerEntries) {
    if (!entry.vendorProfileId) {
      continue;
    }

    const list =
      ledgerByVendor.get(entry.vendorProfileId) ?? [];

    list.push(entry);

    ledgerByVendor.set(
      entry.vendorProfileId,
      list
    );
  }

  /**
   * ------------------------------------------------------------
   * 9. Load parent Orders used by legacy
   *    syncVendorBalances()
   *
   * This mirrors the existing legacy balance calculation:
   * DELIVERED / APPROVED orders.
   * ------------------------------------------------------------
   */

  const parentOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [
          "DELIVERED",
          "APPROVED",
          "delivered",
          "approved",
        ],
      },
    },
    select: {
      id: true,
      orderNumber: true,
      vendorProfileId: true,
      total: true,
      status: true,
    },
  });

  /**
   * ------------------------------------------------------------
   * AUDIT HEADER
   * ------------------------------------------------------------
   */

  console.log(
    "\n=============================================="
  );

  console.log(
    "F4.4 ORDER-LEVEL RECONCILIATION AUDIT"
  );

  console.log(
    "READ-ONLY - NO DATABASE WRITES"
  );

  console.log(
    "==============================================\n"
  );

  console.log(
    `Financial Account: ${payableAccount.code} - ${payableAccount.name}`
  );

  console.log(
    `Currency: ${payableAccount.currency}`
  );

  console.log(
    `Vendors scanned: ${vendors.length}`
  );

  console.log(
    `VendorOrders scanned: ${vendorOrders.length}`
  );

  console.log(
    `MarketplaceTransactions scanned: ${marketplaceTransactions.length}`
  );

  console.log(
    `Vendor Payable ledger entries scanned: ${ledgerEntries.length}`
  );

  console.log(
    `Eligible parent Orders scanned: ${parentOrders.length}\n`
  );

  /**
   * ------------------------------------------------------------
   * 10. Vendor-level reconciliation
   * ------------------------------------------------------------
   */

  for (const vendor of vendors) {
    const vendorOrders =
      vendorOrdersByVendor.get(vendor.id) ?? [];

    const marketplace =
      marketplaceByVendor.get(vendor.id) ?? [];

    const ledger =
      ledgerByVendor.get(vendor.id) ?? [];

    /**
     * VendorOrder totals
     */

    const merchandiseTotal =
      vendorOrders.reduce(
        (
          sum: Prisma.Decimal,
          item
        ) =>
          sum.plus(
            decimal(
              item.merchandiseSubtotal
            )
          ),
        new Prisma.Decimal(0)
      );

    const commissionTotal =
      vendorOrders.reduce(
        (
          sum: Prisma.Decimal,
          item
        ) =>
          sum.plus(
            decimal(
              item.commissionAmount
            )
          ),
        new Prisma.Decimal(0)
      );

    const vendorNetTotal =
      vendorOrders.reduce(
        (
          sum: Prisma.Decimal,
          item
        ) =>
          sum.plus(
            decimal(item.vendorNet)
          ),
        new Prisma.Decimal(0)
      );

    /**
     * MarketplaceTransaction totals
     */

    const marketplaceGross =
      marketplace.reduce(
        (
          sum: Prisma.Decimal,
          tx
        ) =>
          sum.plus(
            decimal(tx.grossAmount)
          ),
        new Prisma.Decimal(0)
      );

    const marketplaceFees =
      marketplace.reduce(
        (
          sum: Prisma.Decimal,
          tx
        ) =>
          sum.plus(
            decimal(tx.platformFee)
          ),
        new Prisma.Decimal(0)
      );

    const marketplaceNet =
      marketplace.reduce(
        (
          sum: Prisma.Decimal,
          tx
        ) =>
          sum.plus(
            decimal(tx.netAmount)
          ),
        new Prisma.Decimal(0)
      );

    /**
     * Financial Ledger totals
     */

    const ledgerCredits =
      ledger.reduce(
        (
          sum: Prisma.Decimal,
          entry
        ) =>
          sum.plus(
            decimal(entry.credit)
          ),
        new Prisma.Decimal(0)
      );

    const ledgerDebits =
      ledger.reduce(
        (
          sum: Prisma.Decimal,
          entry
        ) =>
          sum.plus(
            decimal(entry.debit)
          ),
        new Prisma.Decimal(0)
      );

    const ledgerOutstanding =
      ledgerCredits.minus(
        ledgerDebits
      );

    /**
     * Legacy syncVendorBalances() calculation
     *
     * Existing behavior:
     *
     * 1. Prefer orders where vendorProfileId === vendor.id
     * 2. Otherwise fall back to vendor.userId
     */

    const vendorParentOrders =
      parentOrders.filter(
        (order) =>
          order.vendorProfileId ===
            vendor.id ||
          order.vendorProfileId ===
            vendor.userId
      );

    const syncKey =
      parentOrders.some(
        (order) =>
          order.vendorProfileId ===
          vendor.id
      )
        ? vendor.id
        : vendor.userId;

    const syncCalculatedBalance =
      parentOrders
        .filter(
          (order) =>
            order.vendorProfileId ===
            syncKey
        )
        .reduce(
          (
            sum: Prisma.Decimal,
            order
          ) =>
            sum.plus(
              decimal(order.total)
            ),
          new Prisma.Decimal(0)
        );

    /**
     * ----------------------------------------------------------
     * Vendor header
     * ----------------------------------------------------------
     */

    console.log(
      "----------------------------------------------"
    );

    console.log(
      `VENDOR: ${vendor.id}`
    );

    console.log(
      `USER ID: ${vendor.userId}`
    );

    console.log(
      `CURRENT VendorProfile.balance: ₦${money(
        vendor.balance
      )}`
    );

    if (vendor.score) {
      console.log(
        `Vendor Tier: ${vendor.score.tier}`
      );

      console.log(
        `Current Commission Rate: ${vendor.score.commissionRate}`
      );
    }

    /**
     * ----------------------------------------------------------
     * VendorOrder totals
     * ----------------------------------------------------------
     */

    console.log(
      "\nVendorOrder totals:"
    );

    console.log(
      `  VendorOrders: ${vendorOrders.length}`
    );

    console.log(
      `  Merchandise: ₦${money(
        merchandiseTotal
      )}`
    );

    console.log(
      `  Commission:  ₦${money(
        commissionTotal
      )}`
    );

    console.log(
      `  Vendor Net:  ₦${money(
        vendorNetTotal
      )}`
    );

    /**
     * ----------------------------------------------------------
     * MarketplaceTransaction totals
     * ----------------------------------------------------------
     */

    console.log(
      "\nMarketplaceTransaction totals:"
    );

    console.log(
      `  Transactions: ${marketplace.length}`
    );

    console.log(
      `  Gross:        ₦${money(
        marketplaceGross
      )}`
    );

    console.log(
      `  Platform Fee: ₦${money(
        marketplaceFees
      )}`
    );

    console.log(
      `  Net:          ₦${money(
        marketplaceNet
      )}`
    );

    /**
     * ----------------------------------------------------------
     * Financial Ledger
     * ----------------------------------------------------------
     */

    console.log(
      "\nFinancial Ledger - Vendor Payable (2000):"
    );

    console.log(
      `  Entries:      ${ledger.length}`
    );

    console.log(
      `  Credits:      ₦${money(
        ledgerCredits
      )}`
    );

    console.log(
      `  Debits:       ₦${money(
        ledgerDebits
      )}`
    );

    console.log(
      `  Outstanding:  ₦${money(
        ledgerOutstanding
      )}`
    );

    /**
     * ----------------------------------------------------------
     * Legacy balance synchronization
     * ----------------------------------------------------------
     */

    console.log(
      "\nLegacy syncVendorBalances() comparison:"
    );

    console.log(
      `  Eligible parent Orders: ${vendorParentOrders.length}`
    );

    console.log(
      `  Sync-calculated balance: ₦${money(
        syncCalculatedBalance
      )}`
    );

    /**
     * ----------------------------------------------------------
     * Differences
     * ----------------------------------------------------------
     */

    const currentBalance =
      decimal(vendor.balance);

    const balanceMinusMarketplace =
      currentBalance.minus(
        marketplaceNet
      );

    const balanceMinusLedger =
      currentBalance.minus(
        ledgerOutstanding
      );

    const marketplaceMinusLedger =
      marketplaceNet.minus(
        ledgerOutstanding
      );

    const balanceMinusSync =
      currentBalance.minus(
        syncCalculatedBalance
      );

    console.log(
      "\nDifferences:"
    );

    console.log(
      `  Balance - Marketplace Net: ₦${money(
        balanceMinusMarketplace
      )}`
    );

    console.log(
      `  Balance - Ledger Payable:  ₦${money(
        balanceMinusLedger
      )}`
    );

    console.log(
      `  Marketplace Net - Ledger:  ₦${money(
        marketplaceMinusLedger
      )}`
    );

    console.log(
      `  Balance - Sync Calculation: ₦${money(
        balanceMinusSync
      )}`
    );

    /**
     * ----------------------------------------------------------
     * Order-level reconciliation
     * ----------------------------------------------------------
     */

    console.log(
      "\nOrder-level reconciliation:"
    );

    if (vendorOrders.length === 0) {
      console.log(
        "  No VendorOrders found."
      );
    }

    for (const vendorOrder of vendorOrders) {
      /**
       * Find matching legacy MarketplaceTransaction
       */

      const marketplaceTx =
        marketplace.find(
          (tx) =>
            tx.orderId ===
              vendorOrder.orderId &&
            tx.vendorProfileId ===
              vendor.id
        );

      /**
       * Find Vendor Payable ledger entries
       * belonging to this order.
       */

      const ledgerForOrder =
        ledger.filter(
          (entry) =>
            entry.orderId ===
            vendorOrder.orderId
        );

      const orderLedgerCredits =
        ledgerForOrder.reduce(
          (
            sum: Prisma.Decimal,
            entry
          ) =>
            sum.plus(
              decimal(entry.credit)
            ),
          new Prisma.Decimal(0)
        );

      const orderLedgerDebits =
        ledgerForOrder.reduce(
          (
            sum: Prisma.Decimal,
            entry
          ) =>
            sum.plus(
              decimal(entry.debit)
            ),
          new Prisma.Decimal(0)
        );

      const orderLedgerNet =
        orderLedgerCredits.minus(
          orderLedgerDebits
        );

      /**
       * --------------------------------------------------------
       * Order output
       * --------------------------------------------------------
       */

      console.log(
        "\n  --------------------------------------------"
      );

      console.log(
        `  Order: ${vendorOrder.order.orderNumber} (${vendorOrder.orderId})`
      );

      console.log(
        `  Parent status: ${vendorOrder.order.status}`
      );

      console.log(
        `  VendorOrder status: ${vendorOrder.status}`
      );

      console.log(
        `  Merchandise: ₦${money(
          vendorOrder.merchandiseSubtotal
        )}`
      );

      console.log(
        `  Commission:  ₦${money(
          vendorOrder.commissionAmount
        )}`
      );

      console.log(
        `  Vendor Net:  ₦${money(
          vendorOrder.vendorNet
        )}`
      );

      console.log(
        `  Shipping:    ₦${money(
          vendorOrder.shipping
        )}`
      );

      console.log(
        `  Vendor Total:₦${money(
          vendorOrder.total
        )}`
      );

      /**
       * --------------------------------------------------------
       * MarketplaceTransaction
       * --------------------------------------------------------
       */

      if (marketplaceTx) {
        console.log(
          "  MarketplaceTransaction: FOUND"
        );

        console.log(
          `    Gross: ₦${money(
            marketplaceTx.grossAmount
          )}`
        );

        console.log(
          `    Fee:   ₦${money(
            marketplaceTx.platformFee
          )}`
        );

        console.log(
          `    Net:   ₦${money(
            marketplaceTx.netAmount
          )}`
        );

        console.log(
          `    Status: ${marketplaceTx.status}`
        );

        console.log(
          `    Reference: ${marketplaceTx.reference}`
        );
      } else {
        console.log(
          "  MarketplaceTransaction: NOT FOUND"
        );
      }

      /**
       * --------------------------------------------------------
       * Financial Ledger
       * --------------------------------------------------------
       */

      console.log(
        `  Ledger payable credits: ₦${money(
          orderLedgerCredits
        )}`
      );

      console.log(
        `  Ledger payable debits:  ₦${money(
          orderLedgerDebits
        )}`
      );

      console.log(
        `  Ledger payable net:     ₦${money(
          orderLedgerNet
        )}`
      );
    }
  }

  /**
   * ------------------------------------------------------------
   * AUDIT FOOTER
   * ------------------------------------------------------------
   */

  console.log(
    "\n=============================================="
  );

  console.log(
    "END OF F4.4 AUDIT"
  );

  console.log(
    "==============================================\n"
  );
}

main()
  .catch((error) => {
    console.error(
      "\nF4.4 audit failed:"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });