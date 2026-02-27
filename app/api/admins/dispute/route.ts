import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";
import { UserRole, VendorStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  // 1. Authorization Check
  if (session?.user?.role !== UserRole.ADMIN && session?.user?.role !== UserRole.SUPER_ADMIN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Corrected variable name to vendorProfileId to match your Modal
    const { vendorProfileId, action, reason } = await req.json();

    const isSuspended = action === "SUSPEND";
    const newStatus = action === "SUSPEND" ? VendorStatus.REJECTED : VendorStatus.APPROVED;

    // 2. Update the VendorProfile
    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: { 
        isSuspended: isSuspended,
        status: newStatus,
        rejectionReason: reason 
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // 3. Log to specific Chat History
    const conversation = await prisma.conversation.findFirst({
       where: {
          participantIds: { has: updatedVendor.user.id }, // Finding by the User ID linked to vendor
          type: "VENDOR_ADMIN"
       }
    });

    if (conversation) {
      const logMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: (session.user as any).id,
          senderName: "SYSTEM_ENFORCEMENT",
          content: `🚨 ADMIN ACTION: ${action} | REASON: ${reason}`,
        }
      });

      // Trigger the chat-room update
      await pusherServer.trigger(conversation.id, "new-message", logMessage);

      // Trigger the GLOBAL channel update so the sidebar reflects the new status
      await pusherServer.trigger("global-admin-support", "incoming-support-message", {
        conversationId: conversation.id,
        content: `🚨 [ENFORCEMENT]: ${action}`,
        senderName: "SYSTEM",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Dispute Action Error:", error);
    return new NextResponse("Action Failed", { status: 500 });
  }
}