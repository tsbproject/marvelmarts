import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

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

    if (
      access.conversation.status !==
      "CLOSED"
    ) {
      throw badRequest(
        "Only closed conversations can be deleted."
      );
    }

    const deletedBy =
      access.conversation
        .deletedByParticipantIds ?? [];

    if (
      deletedBy.includes(
        access.userId
      )
    ) {
      return NextResponse.json(
        {
          success: true,
          deleted: false,
        },
        {
          status: 200,
        }
      );
    }

    const result =
      await conversationService.deleteConversation(
        conversationId,
        access.userId
      );

    return NextResponse.json(
      {
        success: true,
        deleted:
          result.everyoneDeleted,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}