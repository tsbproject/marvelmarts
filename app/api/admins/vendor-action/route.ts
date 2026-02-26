import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { sendVendorActionEmail } from "@/app/lib/mailer"; 
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { vendorId, action, reason } = await req.json();

  try {
    let updateData = {};

    if (action === "SUSPEND") {
      updateData = { isSuspended: true, status: "REJECTED" };
    } else if (action === "FLAG") {
      updateData = { status: "PENDING" }; 
    } else if (action === "RESTORE") {
      updateData = { isSuspended: false, status: "APPROVED" };
    }

    const updatedVendor = await prisma.vendorProfile.update({
      where: { userId: vendorId },
      data: updateData,
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    // Log the action in the chat automatically
    const conversation = await prisma.conversation.findFirst({
      where: { 
        participantIds: { has: vendorId },
        type: "VENDOR_ADMIN" 
      }
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          senderName: "MARVELMARTS COMPLIANCE",
          content: `🚨 SYSTEM ACTION: Account has been ${action}ed. \nReason: ${reason}`,
        }
      });
    }

    // Trigger the external mailer
    if (updatedVendor.user?.email) {
      await sendVendorActionEmail({
        email: updatedVendor.user.email,
        name: updatedVendor.user.name || updatedVendor.storeName,
        action,
        reason
      });
    }

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error("ADMIN_VENDOR_ACTION_ERROR:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}