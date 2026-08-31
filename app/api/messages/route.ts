import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { pusherServer } from "@/app/lib/pusherServer";
import { logger } from "@/app/lib/logger";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      const session =
        await requireAuth();

      const {
        content,
        conversationId,
        recipientId,
        recipientRole,
      } = await req.json();

      if (
        !conversationId ||
        !content?.trim()
      ) {
        throw badRequest(
          "Conversation ID and message content are required."
        );
      }

      const message =
        await conversationService.sendMessage(
          conversationId,
          session.user.id,
          session.user.name || "User",
          content.trim()
        );

      try {
        if (
          recipientRole === "VENDOR" &&
          recipientId
        ) {
          await pusherServer.trigger(
            `vendor-${recipientId}`,
            "new-inquiry",
            {
              id: conversationId,
              subject: "New Message Received",
              unreadCount: 1,
              updatedAt:
                new Date().toISOString(),
            }
          );
        }

        await pusherServer.trigger(
          `chat-${conversationId}`,
          "incoming-message",
          message
        );
      } catch (err) {
        logger.error(
          "Pusher Error:",
          err
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