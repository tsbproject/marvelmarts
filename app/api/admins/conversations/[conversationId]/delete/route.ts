import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const userId =
      (session.user as any)?.id || (session.user as any)?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN" ||
      session.user.admin?.manageMessages === true;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        status: true,
        participantIds: true,
        deletedByParticipantIds: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participantIds.includes(userId);

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (conversation.status !== "CLOSED") {
      return NextResponse.json(
        { error: "Only closed chats can be deleted" },
        { status: 400 }
      );
    }

    const deletedByParticipantIds = conversation.deletedByParticipantIds ?? [];

    if (deletedByParticipantIds.includes(userId)) {
      return NextResponse.json({ success: true });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        deletedByParticipantIds: {
          push: userId,
        },
      },
      select: {
        id: true,
        participantIds: true,
        deletedByParticipantIds: true,
      },
    });

    const allParticipantsDeleted = updatedConversation.participantIds.every((id: any) =>
      updatedConversation.deletedByParticipantIds.includes(id)
    );

    if (allParticipantsDeleted) {
      await prisma.$transaction([
        prisma.message.deleteMany({
          where: { conversationId: updatedConversation.id },
        }),
        prisma.conversation.delete({
          where: { id: updatedConversation.id },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_CONVERSATION_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}