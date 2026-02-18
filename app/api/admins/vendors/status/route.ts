import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Role, UserRole, VendorStatus } from "@prisma/client";
import { sendVendorStatusEmail } from "@/app/lib/mailer"; // Ensure this import is correct

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { vendorId, action, reason } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    if (action === "DELETE") {
      await prisma.vendorProfile.delete({ where: { id: vendorId } });
      return NextResponse.json({ success: true, message: "Vendor deleted forever" });
    }

    // TRANSACTION
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
          onboardingUpdate = { completed: true, profileDone: true, storeDone: false, productDone: false };
          
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

      return await tx.vendorProfile.update({
        where: { id: vendorId },
        include: { user: true }, // IMPORTANT: We need this to get user.email and user.name
        data: {
          ...dataUpdate,
          onboarding: onboardingUpdate.completed !== undefined ? {
            upsert: {
              create: onboardingUpdate,
              update: onboardingUpdate
            }
          } : undefined
        }
      });
    });

    // --- TRIGGER EMAIL NOTIFICATION ---
    // Only send if it was an Approval or Rejection
    if (action === "APPROVE" || action === "REJECT") {
      try {
      await sendVendorStatusEmail({
        email: updated.user.email,
        firstName: updated.user.name?.split(" ")[0] || "Merchant", 
        storeName: updated.storeName || "Your Store", 
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        reason: reason || undefined
      });
      } catch (emailErr) {
        // We log the error but don't stop the response because the DB is already updated
        console.error("Mailer Error:", emailErr);
      }
    }

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