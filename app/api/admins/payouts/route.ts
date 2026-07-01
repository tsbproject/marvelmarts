import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManagePayout } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireManagePayout();

    const payouts = await prisma.payout.findMany({
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        payouts: payouts.map((payout) => ({
          id: payout.id,
          vendorProfileId:
            payout.vendorProfileId,

          vendorName:
            payout.vendor?.name ??
            "Unknown Vendor",

          amount: Number(
            payout.amount
          ),

          status: payout.status,

          accountName:
            payout.accountName,

          accountNumber:
            payout.accountNumber,

          bankName:
            payout.bankName,

          createdAt:
            payout.createdAt.toISOString(),
        })),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}