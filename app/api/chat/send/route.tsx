import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { 
      content, 
      recipientId,      // The Vendor's ID
      productId,        // From the product page
      productPrice,     // From the product page
      productImage,     // From the product page
      conversationId    // If this is an ongoing chat
    } = body;

    let conversation;

    // 1. FIND OR CREATE THE CONVERSATION
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
    } else {
      // Create new transmission channel
      conversation = await prisma.conversation.create({
        data: {
          participantIds: [session.user.id, recipientId],
          type: "CUSTOMER_VENDOR",
          subject: "Product Inquiry",
        }
      });
    }

    if (!conversation) return new NextResponse("Chat not found", { status: 404 });

    // 2. SAVE MESSAGE WITH PRODUCT METADATA
    const newMessage = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        // These map directly to your new schema fields
        productId: productId || null,
        productPrice: productPrice || null,
        productImage: productImage || null,
      },
    });

    // 3. REAL-TIME BROADCAST
    // To the specific thread
    await pusherServer.trigger(conversation.id, "new-message", newMessage);

    // To the Vendor's Inbox
    await pusherServer.trigger(`vendor-${recipientId}`, "new-inquiry", {
      ...conversation,
      lastMessage: content,
      unreadCount: 1
    });

    await pusherServer.trigger(`user-${recipientId}`, "new-message", {
    id: newMessage.id,
    content: newMessage.content,
    senderName: session.user.name,
    conversationId: conversation.id
  });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error("CUSTOMER_SEND_ERROR:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}