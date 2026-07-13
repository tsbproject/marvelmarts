import {
  NextRequest,
  NextResponse,
} from "next/server";

import { PayoutService } from "@/app/lib/services/payout.service";

import { pusherServer } from "@/app/lib/pusherServer";
import { sendPayoutStatusEmail } from "@/app/lib/mailer";

import { requireManagePayout } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

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

    const { id } =
      await params;

    const body =
      await req.json();

    const status = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase() as
      | "APPROVED"
      | "REJECTED";

    const remarks =
      body.remarks?.trim() ??
      "";

    const {
      updatedPayout,
      newBalance,
      vendorId,
    } =
      await PayoutService.processPayout(
        id,
        status,
        remarks
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

    if (
      updatedPayout.vendor
        ?.email
    ) {
      try {
        await sendPayoutStatusEmail(
          updatedPayout.vendor
            .email,
          updatedPayout.vendor
            .name ??
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
        message: `Payout ${status.toLowerCase()} successfully.`,
        payout:
          updatedPayout,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}