import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Role, UserRole, VendorStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    // 1. Session & Authorization Check
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { vendorId, action, reason } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    // 2. Immediate Delete Action
    if (action === "DELETE") {
      await prisma.vendorProfile.delete({ where: { id: vendorId } });
      return NextResponse.json({ success: true, message: "Vendor deleted forever" });
    }

    // 3. Transaction for Status Updates
    const updated = await prisma.$transaction(async (tx) => {
      const currentVendor = await tx.vendorProfile.findUnique({
        where: { id: vendorId },
        select: { userId: true }
      });

      if (!currentVendor) throw new Error("Vendor not found");

      let dataUpdate: any = {};
      let onboardingUpdate: any = {};

      switch (action) {
        case "APPROVE":
          dataUpdate = { 
            status: VendorStatus.APPROVED,
            isVerified: true, 
            isSuspended: false,
            rejectionReason: null 
          };
          onboardingUpdate = { completed: true, profileDone: true, storeDone: true, productDone: true };
          
          // Upgrade User Role to VENDOR
          await tx.user.update({ 
            where: { id: currentVendor.userId }, 
            data: { role: UserRole.VENDOR } 
          });
          break;

        case "REJECT":
          dataUpdate = { 
            status: VendorStatus.REJECTED,
            isVerified: false, 
            isSuspended: false,
            rejectionReason: reason || "No reason provided" 
          };
          // Reset onboarding so they can fix details
          onboardingUpdate = { completed: false, profileDone: true, storeDone: false };
          break;

        case "SUSPEND":
          dataUpdate = { isSuspended: true };
          break;

        case "UNSUSPEND":
          dataUpdate = { isSuspended: false };
          break;

        default:
          throw new Error("Invalid action provided");
      }

      // Final Profile Update
      return await tx.vendorProfile.update({
        where: { id: vendorId },
        data: {
          ...dataUpdate,
          // Use 'upsert' for onboarding to prevent crashes if record doesn't exist
          onboarding: onboardingUpdate.completed !== undefined ? {
            upsert: {
              create: onboardingUpdate,
              update: onboardingUpdate
            }
          } : undefined
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `Vendor ${action.toLowerCase()} successfully`, 
      vendor: updated 
    });

  } catch (error: any) {
    console.error("ADMIN_PATCH_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}