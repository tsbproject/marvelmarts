import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";
import { pusherServer } from "@/app/lib/pusherServer";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                              SEND MESSAGE                                  */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  }
) {
  try {
    const { conversationId } = await params;

    const access =
      await requireConversationAccess(
        conversationId
      );

    const body = await req.json();

    const content = body.content?.trim();

    if (!content) {
      throw badRequest(
        "Message content is required."
      );
    }

    if (
      access.conversation.status ===
      "CLOSED"
    ) {
      throw forbidden(
        "This conversation has been closed."
      );
    }

    const newMessage =
      await conversationService.sendMessage(
        conversationId,
        access.userId,
        access.session.user.name ??
          "Unknown User",
        content
      );

    try {
      await Promise.all([
        pusherServer.trigger(
          conversationId,
          "new-message",
          newMessage
        ),

        pusherServer.trigger(
          "global-admin-support",
          "incoming-support-message",
          {
            conversationId,
            content: newMessage.content,
            senderName:
              newMessage.senderName,
            createdAt:
              newMessage.createdAt,
          }
        ),
      ]);
    } catch (error) {
      console.error(
        "PUSHER_ERROR:",
        error
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                           GET CONVERSATION                                 */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  }
) {
  try {
    const { conversationId } = await params;

    const access =
      await requireConversationAccess(
        conversationId
      );

    const messages =
      await conversationService.getMessages(
        conversationId
      );

    return NextResponse.json({
      success: true,

      conversation: {
        id: access.conversation.id,
        status:
          access.conversation.status,
      },

      participants:
        access.conversation.participants,

      messages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}