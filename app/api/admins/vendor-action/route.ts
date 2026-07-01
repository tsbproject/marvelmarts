import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
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

    /* ---------------------------------------------------------------------- */
    /* VERIFY VENDOR                                                          */
    /* ---------------------------------------------------------------------- */

    const existingVendor =
      await prisma.vendorProfile.findUnique({
        where: {
          id: vendorProfileId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

    if (!existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* BUILD UPDATE                                                           */
    /* ---------------------------------------------------------------------- */

    let updateData: Prisma.VendorProfileUpdateInput =
      {};

    switch (action) {
      case "SUSPEND":
        updateData = {
          isSuspended: true,
        };
        break;

      case "FLAG":
        updateData = {
          status: "PENDING",
        };
        break;

      case "RESTORE":
        updateData = {
          isSuspended: false,
        };
        break;

      case "REJECT":
        updateData = {
          status: "REJECTED",
          isSuspended: false,
          rejectionReason: reason ?? null,
        };
        break;

      case "APPROVE":
        updateData = {
          status: "APPROVED",
          isSuspended: false,
          rejectionReason: null,
        };
        break;
    }

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    const vendor =
      await prisma.$transaction(async (tx) => {

        const updatedVendor =
          await tx.vendorProfile.update({
            where: {
              id: vendorProfileId,
            },
            data: updateData,
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          });

        const conversation =
          await tx.conversation.findFirst({
            where: {
              participantIds: {
                has: updatedVendor.userId,
              },
              type: "VENDOR_ADMIN",
            },
          });

        if (conversation) {
          await tx.message.create({
            data: {
              conversationId:
                conversation.id,

              senderId:
                session.user.id,

              senderName:
                "MARVELMARTS COMPLIANCE",

              content:
                `🚨 SYSTEM ACTION: Account has been ${action}.\nReason: ${reason ?? "No reason provided"}`,
            },
          });
        }

        return updatedVendor;
      });

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