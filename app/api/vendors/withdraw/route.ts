import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const body = await req.json();

    const withdrawAmount = Number(
      body.amount
    );

    if (
      !withdrawAmount ||
      withdrawAmount <= 0
    ) {
      throw badRequest(
        "Invalid withdrawal amount."
      );
    }

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    if (vendor.isSuspended) {
      throw forbidden(
        "Account suspended. Withdrawals are locked."
      );
    }

    if (
      withdrawAmount >
      Number(vendor.balance)
    ) {
      throw badRequest(
        "Insufficient balance."
      );
    }

    const [withdrawal] =
      await prisma.$transaction([
        prisma.withdrawal.create({
          data: {
            vendorProfileId:
              vendor.id,
            amount:
              withdrawAmount,
            status: "PENDING",
          },
        }),

        prisma.vendorProfile.update({
          where: {
            id: vendor.id,
          },
          data: {
            balance: {
              decrement:
                withdrawAmount,
            },
          },
        }),
      ]);

    return NextResponse.json(
      {
        success: true,
        message:
          "Withdrawal initiated successfully.",
        withdrawal,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}