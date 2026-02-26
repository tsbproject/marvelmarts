import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { pusherServer } from "@/app/lib/pusherServer";

/**
 * POST: Create a new message and trigger Pusher
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params; // Await params for Next.js 15
    const body = await req.json();
    const { content } = body;

    // 1. Authentication & Validation
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID missing from session" }, { status: 500 });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const cleanContent = DOMPurify.sanitize(content);

    // 2. Database Operation (Transaction)
    const newMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          content: cleanContent,
          conversationId: conversationId,
          senderId: userId,
          senderName: session.user.name || "Administrator",
          isRead: false,
        },
      });

      // Update the parent conversation's timestamp for sorting
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    // 3. Pusher Trigger (Real-time update)
    try {
      await pusherServer.trigger(conversationId, "new-message", {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString(),
      });
    } catch (pusherError) {
      console.error("PUSHER_TRIGGER_ERROR:", pusherError);
      // Non-fatal: Message is already saved in DB
    }

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    console.error("MESSAGE_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch messages for a specific conversation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params; // Await params for Next.js 15

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("MESSAGE_GET_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}