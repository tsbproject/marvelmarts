import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";
import { UserRole, VendorStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== UserRole.ADMIN && session?.user?.role !== UserRole.SUPER_ADMIN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { vendorId, action, reason } = await req.json();

  try {
    // TACTICAL MAPPING based on your specific Schema:
    // If action is SUSPEND: isSuspended = true, status remains APPROVED (or goes to REJECTED)
    // If action is RESTORE: isSuspended = false, status = APPROVED
    
    const isSuspended = action === "SUSPEND";
    const newStatus = action === "SUSPEND" ? VendorStatus.REJECTED : VendorStatus.APPROVED;

    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { 
        isSuspended: isSuspended, // Using your boolean field
        status: newStatus,         // Using your Enum values
        rejectionReason: reason    // Logging the reason in your DB field
      },
    });

    // 2. Log to Chat History for the Vendor to see
    const conversation = await prisma.conversation.findFirst({
       where: {
         participantIds: { has: vendorId },
         type: "VENDOR_ADMIN"
       }
    });

    if (conversation) {
      const logMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          senderName: "SYSTEM_ENFORCEMENT",
          content: `🚨 ADMIN ACTION: ${action} | REASON: ${reason}`,
        }
      });

      await pusherServer.trigger(conversation.id, "new-message", {
        ...logMessage,
        senderRole: "ADMIN"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dispute Action Error:", error);
    return new NextResponse("Action Failed", { status: 500 });
  }
}