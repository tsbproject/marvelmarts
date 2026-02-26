import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { ConversationType } from "@prisma/client";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, isVendor } = body;

    console.log("--- CHAT INITIATION START ---");

    // 1. Locate the User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (!user) {
      return new NextResponse("User not found. Please use your registered email.", { status: 404 });
    }

    // 2. Determine conversation type
    const type = isVendor ? ConversationType.VENDOR_ADMIN : ConversationType.CUSTOMER_ADMIN;

    // 3. Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: type,
        participantIds: { has: user.id },
      },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        participants: { select: { id: true, name: true, role: true } } // Added for consistency
      }
    });

    if (!conversation) {
      console.log("Creating new conversation...");
      
      // 4. Find staff
      const admin = await prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
          isSuspended: false,
        },
      });

      if (!admin) {
        return new NextResponse("Support is currently offline.", { status: 503 });
      }

      // 5. Create conversation
      conversation = await prisma.conversation.create({
        data: {
          type: type,
          subject: isVendor ? `Vendor Support: ${name}` : `Customer Support: ${name}`,
          participantIds: [user.id, admin.id],
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          },
          messages: true, 
        }
      });

      // 6. Automated Welcome Message
      const welcomeMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: "SYSTEM",
          senderName: "MarvelMarts Support",
          content: `Hello ${name}, thank you for reaching out. A member of our team will be with you shortly.`,
        },
      });

      // 7. Trigger Global Pusher Event (For Dropdown Badge & Sidebar)
      await pusherServer.trigger("global-admin-channel", "new-support-ticket", {
        ...conversation,
        messages: [welcomeMessage],
      });
    }

    return NextResponse.json({ 
      conversationId: conversation.id,
      type: conversation.type
    });

  } catch (error: any) {
    console.error("--- CHAT INITIATION ERROR ---", error.message);
    return new NextResponse(`Internal Server Error`, { status: 500 });
  }
}