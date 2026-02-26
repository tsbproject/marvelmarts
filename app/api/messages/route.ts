import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer"; 

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content, conversationId, recipientId, recipientRole } = await req.json();

    // 1. Save Message to Database
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: session.user.id,
        senderName: session.user.name || "User",
      },
    });

    // 2. Update Conversation Timestamp (for sorting)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 3. Trigger Pusher Event
    // If the recipient is a vendor, we trigger to their specific channel
    if (recipientRole === "VENDOR") {
      await pusherServer.trigger(`vendor-${recipientId}`, "new-inquiry", {
        id: conversationId,
        subject: "New Message Received", // Or fetch the actual subject
        unreadCount: 1,
        updatedAt: new Date(),
      });
    }

    // Also trigger to the specific conversation channel for the chat UI
    await pusherServer.trigger(`chat-${conversationId}`, "incoming-message", message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("PUSHER_TRIGGER_ERROR:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}