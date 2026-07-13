import { NextResponse } from "next/server";
import { VendorService } from "@/app/lib/services/vendor.service";
import { sendVendorActionEmail } from "@/app/lib/mailer";

import {
  requireManageVendors,
  requireManageVerifications,
} from "@/app/lib/auth/guards";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VendorAction =
  | "SUSPEND"
  | "FLAG"
  | "RESTORE"
  | "REJECT"
  | "APPROVE";

interface VendorActionRequest {
  vendorProfileId: string;
  action: VendorAction;
  reason?: string;
}

const ALLOWED_ACTIONS = new Set<VendorAction>([
  "SUSPEND",
  "FLAG",
  "RESTORE",
  "REJECT",
  "APPROVE",
]);

export async function PATCH(req: Request) {
  try {
    /* ---------------------------------------------------------------------- */
    /* REQUEST                                                                */
    /* ---------------------------------------------------------------------- */

    const body =
      (await req.json()) as VendorActionRequest;

    const {
      vendorProfileId,
      action,
      reason,
    } = body;

    if (!vendorProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor profile id is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid vendor action.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const session =
      action === "APPROVE" ||
      action === "REJECT"
        ? await requireManageVerifications()
        : await requireManageVendors();
    const vendor =
      await VendorService.performVendorAction(
        vendorProfileId,
        action,
        reason,
        session.user.id
      );

    /* ---------------------------------------------------------------------- */
    /* EMAIL                                                                  */
    /* ---------------------------------------------------------------------- */

    if (vendor.user?.email) {
      await sendVendorActionEmail({
        email: vendor.user.email,
        name:
          vendor.user.name ??
          vendor.storeName,

        action:
          action as
            | "SUSPEND"
            | "RESTORE",

        reason:
          reason ?? "",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* AUDIT                                                                  */
    /* ---------------------------------------------------------------------- */

    console.log(
      `[Vendor Action] ${action} | Admin: ${session.user.email} | Vendor: ${vendor.user?.email}`
    );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        vendor,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    return handleApiError(error);
  }
}