import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { realtimeService } from "@/app/lib/realtime/realtime.service";

import { requireManageVendors } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

import { VendorStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DisputeAction =
  | "SUSPEND"
  | "RESTORE";

export async function PATCH(req: Request) {
  try {
    const session =
      await requireManageVendors();

    const body = await req.json();

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

    if (
      action !== "SUSPEND" &&
      action !== "RESTORE"
    ) {
      throw badRequest(
        "Invalid action."
      );
    }

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          id: vendorProfileId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor not found."
      );
    }

    const updatedVendor =
      await prisma.vendorProfile.update({
        where: {
          id: vendorProfileId,
        },
        data: {
          isSuspended:
            action === "SUSPEND",

          status:
            action === "SUSPEND"
              ? VendorStatus.REJECTED
              : VendorStatus.APPROVED,

          rejectionReason:
            reason ?? null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          participantIds: {
            has: updatedVendor.user.id,
          },
          type: "VENDOR_ADMIN",
        },
      });

    if (conversation) {
      const logMessage =
        await prisma.message.create({
          data: {
            conversationId:
              conversation.id,

            senderId:
              session.user.id,

            senderName:
              "SYSTEM_ENFORCEMENT",

            content:
              `🚨 ADMIN ACTION: ${action}\nReason: ${
                reason || "No reason provided"
              }`,
          },
        });

      await Promise.all([
        realtimeService.broadcastMessage(
          conversation.id,
          logMessage
        ),

        realtimeService.broadcastIncomingSupport(
          conversation.id,
          {
            content:
              `🚨 [ENFORCEMENT]: ${action}`,
            senderName: "SYSTEM",
            createdAt: new Date(),
          }
        ),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        vendor: updatedVendor,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}