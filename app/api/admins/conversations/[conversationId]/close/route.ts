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

export async function PATCH(
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

    if (!access.isAdmin) {
      throw forbidden(
        "Only administrators can close conversations."
      );
    }

    if (
      access.conversation.status ===
      "CLOSED"
    ) {
      throw badRequest(
        "Conversation is already closed."
      );
    }

    const result =
      await conversationService.closeConversation(
        conversationId,
        access.userId,
        access.session.user.role
      );

    try {
      await Promise.all([
        pusherServer.trigger(
          conversationId,
          "new-message",
          result.systemMessage
        ),

        pusherServer.trigger(
          conversationId,
          "conversation-closed",
          {
            conversationId,
            status: "CLOSED",
          }
        ),

        pusherServer.trigger(
          "global-admin-support",
          "conversation-closed",
          {
            conversationId,
            status: "CLOSED",
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
        conversation:
          result.conversation,
        message:
          result.systemMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}