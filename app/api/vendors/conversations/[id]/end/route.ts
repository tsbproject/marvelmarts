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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Conversation ID is missing" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        participantIds: true,
        status: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participantIds.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (conversation.status === "CLOSED") {
      return NextResponse.json({
        success: true,
        status: "CLOSED",
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: {
        status: "CLOSED",
        endedAt: new Date(),
        endedById: session.user.id,
        endedByRole: "VENDOR",
      },
      select: {
        id: true,
        status: true,
        endedAt: true,
        endedByRole: true,
      },
    });

    await pusherServer.trigger(id, "conversation-ended", {
      status: updatedConversation.status,
      endedAt: updatedConversation.endedAt,
      endedByRole: updatedConversation.endedByRole,
    });

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("END_CHAT_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}