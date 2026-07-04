import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";
import {
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const { conversationId } =
      await params;

    const session =
      await getServerSession(authOptions);

    const guestAccessToken =
      req.nextUrl.searchParams.get(
        "guestAccessToken"
      );

    let conversation;

    if (session?.user?.id) {
      const access =
        await requireConversationAccess(
          conversationId
        );

      conversation =
        access.conversation;
    } else {
      conversation =
        await conversationService.getConversation(
          conversationId
        );

      if (!conversation) {
        throw notFound(
          "Conversation not found."
        );
      }

      if (!conversation.isGuest) {
        throw forbidden(
          "Authentication required."
        );
      }

      if (
        guestAccessToken !==
        conversation.guestAccessToken
      ) {
        throw forbidden(
          "Invalid guest access token."
        );
      }
    }

    const messages =
      await conversationService.getMessages(
        conversationId
      );

    return NextResponse.json(
      {
        success: true,

        conversation: {
          id: conversation.id,
          subject:
            conversation.subject,
          type:
            conversation.type,
          status:
            conversation.status,
          isGuest:
            conversation.isGuest,
          visitorName:
            conversation.visitorName,
          visitorEmail:
            conversation.visitorEmail,
          endedAt:
            conversation.endedAt,
          endedById:
            conversation.endedById,
          endedByRole:
            conversation.endedByRole,
          createdAt:
            conversation.createdAt,
          updatedAt:
            conversation.updatedAt,
        },

        messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}