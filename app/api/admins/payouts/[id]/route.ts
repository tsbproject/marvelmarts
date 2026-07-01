import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendPayoutStatusEmail } from "@/app/lib/mailer";

import { requireManagePayout } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  conflict,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
    await requireManagePayout();

    const { id } = await params;

    const body = await req.json();

    const status = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase();

    const remarks =
      body.remarks?.trim() || "";

    if (!id || !status) {
      throw badRequest(
        "Payout ID and status are required."
      );
    }

    if (
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      throw badRequest(
        "Invalid payout status."
      );
    }

    const payout =
      await prisma.payout.findUnique({
        where: {
          id,
        },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    if (!payout) {
      throw notFound(
        "Payout request not found."
      );
    }

    if (payout.status !== "PENDING") {
      throw conflict(
        `Payout has already been processed as ${payout.status}.`
      );
    }

    const {
      updatedPayout,
      newBalance,
      vendorId,
    } = await prisma.$transaction(
      async (tx) => {
        const updatedPayout =
          await tx.payout.update({
            where: {
              id,
            },
            data: {
              status,
              adminRemarks:
                remarks ||
                (status === "APPROVED"
                  ? "Processed by Administrator"
                  : "Rejected by Administrator"),
              processedAt: new Date(),
            },
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

        let newBalance: number | null =
          null;

        if (status === "REJECTED") {
          const profile =
            await tx.vendorProfile.update({
              where: {
                id: payout.vendorProfileId,
              },
              data: {
                balance: {
                  increment:
                    payout.amount,
                },
              },
            });

          newBalance = Number(
            profile.balance
          );
        }

        return {
          updatedPayout,
          newBalance,
          vendorId: payout.vendorId,
        };
      }
    );

    try {
      await pusherServer.trigger(
        `vendor-${vendorId}`,
        "payout-updated",
        {
          requestId:
            updatedPayout.id,

          status,

          amount:
            updatedPayout.amount,

          newBalance,

          remarks:
            remarks ||
            "Processed",
        }
      );
    } catch (error) {
      console.error(
        "PUSHER_PAYOUT_ERROR:",
        error
      );
    }

    if (updatedPayout.vendor?.email) {
      try {
        await sendPayoutStatusEmail(
          updatedPayout.vendor.email,
          updatedPayout.vendor.name ??
            "Vendor",
          updatedPayout.amount,
          status,
          remarks
        );
      } catch (error) {
        console.error(
          "PAYOUT_EMAIL_ERROR:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          `Payout ${status.toLowerCase()} successfully.`,
        payout: updatedPayout,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}