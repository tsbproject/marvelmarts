import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const access =
      await requireConversationAccess(
        id
      );

    const messages =
      await conversationService.getMessages(
        id
      );

    return NextResponse.json(
      {
        success: true,

        conversation: {
          id: access.conversation.id,
          subject:
            access.conversation.subject,
          type:
            access.conversation.type,
          status:
            access.conversation.status,
          isGuest:
            access.conversation.isGuest,
          visitorName:
            access.conversation.visitorName,
          visitorEmail:
            access.conversation.visitorEmail,
          endedAt:
            access.conversation.endedAt,
          endedById:
            access.conversation.endedById,
          endedByRole:
            access.conversation.endedByRole,
          createdAt:
            access.conversation.createdAt,
          updatedAt:
            access.conversation.updatedAt,
        },

        participants:
          access.conversation.participants,

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