import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";
import { pusherServer } from "@/app/lib/pusherServer";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";

import {
  badRequest,
  forbidden,
} from "@/app/lib/auth/errors";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (
    req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        id: string;
      }>;
    }
  ) => {
    try {
      verifyOrigin(req);

      const { id: conversationId } =
        await params;

      const access =
        await requireConversationAccess(
          conversationId
        );

      const body =
        await req.json();

      const content =
        body.content?.trim();

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
          "This conversation has already been closed."
        );
      }

      const message =
        await conversationService.sendMessage(
          conversationId,
          access.userId,
          access.session?.user.name ??
            "Vendor",
          content
        );

      try {
        await Promise.all([
          pusherServer.trigger(
            conversationId,
            "new-message",
            message
          ),

          pusherServer.trigger(
            "global-admin-support",
            "incoming-support-message",
            {
              conversationId,
              content:
                message.content,
              senderName:
                message.senderName,
              createdAt:
                message.createdAt,
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
          message,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);