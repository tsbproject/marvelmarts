import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { sendVendorActionEmail } from "@/app/lib/mailer";
import type { Permissions } from "@/types/admin";
import { serializeAdminPermissions,} from "@/app/lib/auth/admin-permissions";
import { defaultPermissions } from "@/types/admin";
import type { Prisma } from "@prisma/client";

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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    const userRoles = Array.isArray(session.user.roles)
      ? session.user.roles
      : [];

    const isSuperAdmin =
      userRole === "SUPER_ADMIN" ||
      userRoles.includes("SUPER_ADMIN");

    const isAdmin =
      userRole === "ADMIN" ||
      isSuperAdmin ||
      userRoles.includes("ADMIN");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    let body: VendorActionRequest;

      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid request body." },
          { status: 400 }
        );
      }

    const {
      vendorProfileId,
      action,
      reason,
    } = body;

    if (
      !vendorProfileId ||
      typeof vendorProfileId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid vendor profile id" },
        { status: 400 }
      );
    }

    const allowedActions = new Set<VendorAction>([
      "SUSPEND",
      "FLAG",
      "RESTORE",
      "REJECT",
      "APPROVE",
    ]);

    if (!allowedActions.has(action)) {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    const adminProfile = await prisma.adminProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

        if (!isSuperAdmin && !adminProfile) {
      return NextResponse.json(
        {
          error:
            "Administrator profile not found. Please contact a Super Administrator.",
        },
        { status: 403 }
      );
    }

const permissions = adminProfile ? serializeAdminPermissions(adminProfile): defaultPermissions;
   
  if (!isSuperAdmin) {
      const needsVendorPermission = [
        "SUSPEND",
        "FLAG",
        "RESTORE",
      ].includes(action);

      const needsVerificationPermission = [
        "APPROVE",
        "REJECT",
      ].includes(action);

      if (
        needsVendorPermission &&
        !permissions?.manageVendors
      ) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to manage vendors.",
          },
          { status: 403 }
        );
      }

      if (
        needsVerificationPermission &&
        !permissions?.manageVerifications
      ) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to manage vendor verifications.",
          },
          { status: 403 }
        );
      }
    }

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
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const updateData: Prisma.VendorProfileUpdateInput =
      (() => {
        switch (action) {
          case "SUSPEND":
            return {
              isSuspended: true,
            };

          case "FLAG":
            return {
              status: "PENDING",
            };

          case "RESTORE":
            return {
              isSuspended: false,
            };

          case "REJECT":
            return {
              status: "REJECTED",
              isSuspended: false,
            };

          case "APPROVE":
            return {
              status: "APPROVED",
              isSuspended: false,
            };

          default:
            return {};
        }
      })();

    const updatedVendor = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendorProfile.update({
        where: { id: vendorProfileId },
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

      const conversation = await tx.conversation.findFirst({
        where: {
          participantIds: { has: vendor.userId },
          type: "VENDOR_ADMIN",
        },
      });

      if (conversation) {
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: session.user.id,
            senderName: "MARVELMARTS COMPLIANCE",
            content: `🚨 SYSTEM ACTION: Account has been ${action}.
    Reason: ${reason || "No reason provided"}`,
          },
        });
      }

      return vendor;
    });

    if (updatedVendor.user?.email) {
      await sendVendorActionEmail({
        email: updatedVendor.user.email,
        name:
          updatedVendor.user.name ||
          updatedVendor.storeName,
        action: action as "SUSPEND" | "RESTORE",
        reason: reason ?? "",
      });
    }

    return NextResponse.json({
      success: true,
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error(
      "ADMIN_VENDOR_ACTION_ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Action failed" },
      { status: 500 }
    );
  }
}