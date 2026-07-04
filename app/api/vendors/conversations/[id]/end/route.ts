import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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
    const { id: conversationId } =
      await params;

    const access =
      await requireConversationAccess(
        conversationId
      );

    if (
      access.conversation.status ===
      "CLOSED"
    ) {
      return NextResponse.json(
        {
          success: true,
          status: "CLOSED",
        },
        {
          status: 200,
        }
      );
    }

    const conversation =
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          status: "CLOSED",
          endedAt: new Date(),
          endedById: access.userId,
          endedByRole: "VENDOR",
        },
        select: {
          id: true,
          status: true,
          endedAt: true,
          endedByRole: true,
        },
      });

    try {
      await Promise.all([
        pusherServer.trigger(
          conversationId,
          "conversation-ended",
          {
            status:
              conversation.status,
            endedAt:
              conversation.endedAt,
            endedByRole:
              conversation.endedByRole,
          }
        ),

        pusherServer.trigger(
          "global-admin-support",
          "conversation-ended",
          {
            conversationId,
            status:
              conversation.status,
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
        conversation,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}