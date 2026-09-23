import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleApiError, requireManagePayout } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VENDOR_ID = "cmn803wni000a8svjstuwe25s";
const PAYABLE_ACCOUNT = "2000";

export const GET = withApiLogging(async (req: Request) => {
  try {
    verifyOrigin(req);
    await requireManagePayout();

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: VENDOR_ID },
      select: {
        id: true,
        storeName: true,
        balance: true,
        firstName: true,
        lastName: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const payouts = await prisma.payout.findMany({
      where: {
        vendorProfileId: VENDOR_ID,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        reference: true,
        vendorId: true,
        vendorProfileId: true,
        accountName: true,
        accountNumber: true,
        bankName: true,
        adminRemarks: true,
        createdAt: true,
        updatedAt: true,
        processedAt: true,
      },
    });

    const account = await prisma.financialAccount.findUnique({
      where: {
        code: PAYABLE_ACCOUNT,
      },
      select: {
        id: true,
        code: true,
        name: true,
        currency: true,
        isActive: true,
      },
    });

    if (!account) {
      throw new Error("Financial account 2000 not found.");
    }

    const ledgerEntries = await prisma.financialLedgerEntry.findMany({
      where: {
        accountId: account.id,
        vendorProfileId: VENDOR_ID,
        transaction: {
          status: "POSTED",
        },
      },
      orderBy: [
        { createdAt: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        transactionId: true,
        debit: true,
        credit: true,
        currency: true,
        description: true,
        orderId: true,
        vendorProfileId: true,
        userId: true,
        createdAt: true,
        transaction: {
          select: {
            id: true,
            reference: true,
            type: true,
            status: true,
            amount: true,
            description: true,
            orderId: true,
            externalReference: true,
            idempotencyKey: true,
            occurredAt: true,
            createdAt: true,
          },
        },
      },
    });

    const totalCredits = ledgerEntries.reduce(
      (sum, entry) => sum + Number(entry.credit),
      0,
    );

    const totalDebits = ledgerEntries.reduce(
      (sum, entry) => sum + Number(entry.debit),
      0,
    );

    const vendorOrders = await prisma.vendorOrder.findMany({
  where: {
    vendorProfileId: VENDOR_ID,
  },
  orderBy: {
    createdAt: "asc",
  },
  select: {
    id: true,
    orderId: true,
    merchandiseSubtotal: true,
    shipping: true,
    total: true,
    commissionRate: true,
    commissionAmount: true,
    vendorNet: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    order: {
      select: {
        orderNumber: true,
        status: true,
        subtotal: true,
        shipping: true,
        total: true,
        paymentStatus: true,
      },
    },
  },
});


    const marketplaceTransactions =
      await prisma.marketplaceTransaction.findMany({
        where: {
          vendorProfileId: VENDOR_ID,
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

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        vendorProfileId: VENDOR_ID,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      vendor,
      payouts,
      financialAccount: account,
      ledger: {
        entries: ledgerEntries,
        totals: {
          totalCredits,
          totalDebits,
          outstanding: totalCredits - totalDebits,
          entryCount: ledgerEntries.length,
        },
      },
      vendorOrders,
      marketplaceTransactions,
      withdrawals,
    });
  } catch (error) {
    return handleApiError(error);
  }
});