import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN" ||
      session.user.permissions?.manageMessages === true;

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminUserId =
      (session.user as any).id || (session.user as any).sub;

    const adminRole =
      session.user.role || "ADMIN";

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.status === "CLOSED") {
      return NextResponse.json(
        { error: "Conversation is already closed" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedConversation = await tx.conversation.update({
        where: { id: conversationId },
        data: {
          status: "CLOSED",
          endedAt: new Date(),
          endedById: adminUserId,
          endedByRole: adminRole,
        },
      });

      const systemMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: "SYSTEM",
          senderName: "MarvelMarts Support",
          content: "This support session has been ended by an administrator.",
        },
      });

      return { updatedConversation, systemMessage };
    });

    await Promise.all([
      pusherServer.trigger(conversationId, "new-message", result.systemMessage),
      pusherServer.trigger(conversationId, "conversation-closed", {
        conversationId,
        status: "CLOSED",
      }),
      pusherServer.trigger("global-admin-support", "conversation-closed", {
        conversationId,
        status: "CLOSED",
      }),
    ]);

    return NextResponse.json({
      success: true,
      conversation: result.updatedConversation,
      message: result.systemMessage,
    });
  } catch (error: any) {
    console.error("CLOSE_CONVERSATION_ERROR:", error.message || error);
    return NextResponse.json(
      { error: "Failed to close conversation" },
      { status: 500 }
    );
  }
}