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

/* -------------------------------------------------------------------------- */
/*                          CREATE PAYOUT REQUEST                             */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const body = await req.json();

    const amount = Number(
      body.amount
    );

    if (!amount || amount <= 0) {
      throw badRequest(
        "Invalid payout amount."
      );
    }

    const profile =
      await prisma.vendorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!profile) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    if (
      !profile.bankName ||
      !profile.accountNumber ||
      !profile.accountName
    ) {
      throw badRequest(
        "Complete your payout details before requesting a payout."
      );
    }

    if (profile.isSuspended) {
      throw forbidden(
        "Your vendor account is suspended."
      );
    }

    if (
      Number(profile.balance) < amount
    ) {
      throw badRequest(
        "Insufficient balance."
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const payout =
            await tx.payout.create({
              data: {
                amount,
                status: "PENDING",
                vendorId:
                  session.user.id,
                vendorProfileId:
                  profile.id,
                bankName:
                  profile.bankName,
                accountNumber:
                  profile.accountNumber,
                accountName:
                  profile.accountName,
                reference:
                  `PAYOUT-${Date.now()}-${Math.floor(
                    Math.random() *
                      100000
                  )}`,
              },
            });

          const updatedProfile =
            await tx.vendorProfile.update({
              where: {
                id: profile.id,
              },
              data: {
                balance: {
                  decrement:
                    amount,
                },
              },
            });

          return {
            payout,
            newBalance:
              Number(
                updatedProfile.balance
              ),
          };
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Payout request submitted successfully.",
        payout:
          result.payout,
        newBalance:
          result.newBalance,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                           GET MY PAYOUTS                                   */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session =
      await requireVendor();

    const payouts =
      await prisma.payout.findMany({
        where: {
          vendorId:
            session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        success: true,
        payouts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}