import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log("--- START MESSAGE POST ---");
    const session = await getServerSession(authOptions);
    const { conversationId } = params;
    const body = await req.json();

    // 1. Log Session Data
    console.log("User in Session:", session?.user?.email);
    console.log("User ID in Session:", (session?.user as any)?.id);

    if (!session?.user) {
      console.error("ERROR: No session user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      console.error("ERROR: session.user.id is undefined. Check your NextAuth session callback.");
      return NextResponse.json({ error: "User ID missing from session" }, { status: 500 });
    }

    // 2. Log Content
    console.log("Content received:", body.content);
    const cleanContent = DOMPurify.sanitize(body.content);

    // 3. Database Operation
    console.log("Attempting Prisma Create...");
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

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });
    console.log("Prisma Create Success!");

    // 4. Pusher Trigger
    try {
      console.log("Attempting Pusher Trigger...");
      await pusherServer.trigger(conversationId, "new-message", newMessage);
      console.log("Pusher Trigger Success!");
    } catch (pErr) {
      console.error("PUSHER ERROR (Non-fatal):", pErr);
    }

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}