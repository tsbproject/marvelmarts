import { NextResponse } from "next/server";

import { PayoutService } from "@/app/lib/services/payout.service";

import { pusherServer } from "@/app/lib/pusherServer";
import { sendPayoutStatusEmail } from "@/app/lib/mailer";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { logger } from "@/app/lib/logger";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export const PATCH =
  withApiLogging(
    async (
      req: Request,
      { params }: Context
    ) => {
      try {
        verifyOrigin(req);

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
          body.remarks?.trim() ?? "";

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
          logger.error(
            "PUSHER_PAYOUT_ERROR:",
            error
          );
        }

        if (
          updatedPayout.vendor?.email
        ) {
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
            logger.error(
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
  );