import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import { realtimeService } from "@/app/lib/realtime/realtime.service";

import { requireManageVendors } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DisputeAction =
  | "SUSPEND"
  | "RESTORE";

export async function PATCH(
  req: Request
) {
  try {
    const session =
      await requireManageVendors();

    const body =
      await req.json();

    const {
      vendorProfileId,
      action,
      reason,
    } = body;

    if (!vendorProfileId) {
      throw badRequest(
        "Vendor profile is required."
      );
    }

    const result =
      await VendorService.handleVendorEnforcementAction(
        vendorProfileId,
        action,
        reason,
        session.user.id
      );

    if (
      result.conversation &&
      result.logMessage
    ) {
      await Promise.all([
        realtimeService.broadcastMessage(
          result.conversation.id,
          result.logMessage
        ),

        realtimeService.broadcastIncomingSupport(
          result.conversation.id,
          {
            content:
              `🚨 [ENFORCEMENT]: ${action}`,
            senderName:
              "SYSTEM",
            createdAt:
              new Date(),
          }
        ),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        vendor:
          result.vendor,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}