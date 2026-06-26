import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;
    const { content } = await req.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.status === "CLOSED") {
      return NextResponse.json(
        { error: "This conversation has been closed." },
        { status: 403 }
      );
    }

    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
    const isAuthenticated = !!userId;

    const senderId = isAuthenticated ? userId : `public-${conversationId}`;
    const senderName = isAuthenticated
      ? session?.user?.name || "Administrator"
      : "Customer";

    const newMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          content: content.trim(),
          conversationId,
          senderId,
          senderName,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    try {
      await Promise.all([
        pusherServer.trigger(conversationId, "new-message", newMessage),
        pusherServer.trigger("global-admin-support", "incoming-support-message", {
          conversationId,
          content: newMessage.content,
          senderName: newMessage.senderName,
          createdAt: newMessage.createdAt,
        }),
      ]);
    } catch (pusherError) {
      console.error("PUSHER_RUNTIME_ERROR:", pusherError);
    }

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error("CRITICAL_API_ERROR:", error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   try {
//     const { conversationId } = await params;

//     const conversation = await prisma.conversation.findUnique({
//       where: { id: conversationId },
//       select: {
//         id: true,
//         status: true,
//         participants: {
//           select: {
//             id: true,
//             name: true,
//             role: true,
//             vendorProfile: {
//               select: { id: true },
//             },
//           },
//         },
//       },
//     });

//     if (!conversation) {
//       return NextResponse.json(
//         { error: "Conversation not found" },
//         { status: 404 }
//       );
//     }

//     const messages = await prisma.message.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json({
//       messages,
//       participants: conversation.participants,
//       conversation: {
//         id: conversation.id,
//         status: conversation.status,
//       },
//     });
//   } catch (error) {
//     return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
//   }
// }


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", debug: "no-session-user" },
        { status: 401 }
      );
    }

    const { conversationId } = await params;

    const userId =
      (session.user as any)?.id || (session.user as any)?.sub || null;

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
        participants: {
          select: {
            id: true,
            name: true,
            role: true,
            vendorProfile: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found",
          debug: "conversation-not-found",
          conversationId,
        },
        { status: 404 }
      );
    }

    const participantIds = conversation.participantIds ?? [];
    const deletedByParticipantIds = conversation.deletedByParticipantIds ?? [];

    const isParticipant = !!userId && participantIds.includes(userId);
    const isDeletedForUser = !!userId && deletedByParticipantIds.includes(userId);

    console.log("GET_CONVERSATION_DEBUG", {
      conversationId,
      userId,
      role: session.user.role,
      isAdmin,
      participantIds,
      deletedByParticipantIds,
      isParticipant,
      isDeletedForUser,
    });

    if (!isParticipant && !isAdmin) {
      return NextResponse.json(
        {
          error: "Forbidden",
          debug: "not-participant-and-not-admin",
          userId,
          isAdmin,
        },
        { status: 403 }
      );
    }

    if (isDeletedForUser) {
      return NextResponse.json(
        {
          error: "Conversation not available",
          debug: "conversation-deleted-for-user",
          userId,
          conversationId,
        },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages,
      participants: conversation.participants,
      conversation: {
        id: conversation.id,
        status: conversation.status,
      },
    });
  } catch (error) {
    console.error("GET_CONVERSATION_ERROR:", error);
    return NextResponse.json(
      {
        error: "Fetch failed",
        debug: error instanceof Error ? error.message : "unknown-error",
      },
      { status: 500 }
    );
  }
}