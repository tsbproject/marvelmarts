import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import { sendVendorStatusEmail } from "@/app/lib/mailer";

import {
  handleApiError,
  requireManageVerifications,
} from "@/app/lib/auth/api";
import { logger } from "@/app/lib/logger";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH =
  withApiLogging(
    async (req: Request) => {
      try {
        await requireManageVerifications();

        const {
          vendorProfileId,
          action,
          reason,
        } = await req.json();

        const result =
          await VendorService.processVendorVerification(
            vendorProfileId,
            action,
            reason
          );

        if (result.deleted) {
          return NextResponse.json({
            success: true,
            message:
              "Vendor deleted successfully",
          });
        }

        const vendor = result.vendor!;

        if (
          action === "APPROVE" ||
          action === "REJECT"
        ) {
          try {
            await sendVendorStatusEmail({
              email:
                vendor.user.email,

              firstName:
                vendor.user.name?.split(
                  " "
                )[0] ??
                "Merchant",

              storeName:
                vendor.storeName ??
                "Your Store",

              status:
                action === "APPROVE"
                  ? "APPROVED"
                  : "REJECTED",

              reason:
                reason ||
                (action === "REJECT"
                  ? "Documents provided were insufficient."
                  : undefined),
            });
          } catch (error) {
            logger.error(
              "MAILER_ERROR:",
              error
            );
          }
        }

        return NextResponse.json({
          success: true,
          message:
            `Vendor ${action.toLowerCase()} successfully`,
          vendor,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );