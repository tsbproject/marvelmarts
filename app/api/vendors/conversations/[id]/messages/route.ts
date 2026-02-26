import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    const { id } = resolvedParams; // This matches conversationId
    const { content } = await req.json();

    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Save to Database
    const newMessage = await prisma.message.create({
      data: {
        content,
        conversationId: id,
        senderId: session.user.id,
        senderName: session.user.name || "Vendor",
      },
    });

    // 2. Update Conversation (for sorting in inbox)
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // 3. TACTICAL TRIGGER
    // This MUST match the customer's pusherClient.subscribe(conversationId)
    await pusherServer.trigger(id, "new-message", newMessage);

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("REPLY_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}