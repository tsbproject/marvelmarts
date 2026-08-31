import { NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";
import { pusherServer } from "@/app/lib/pusherServer";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
} from "@/app/lib/auth/errors";
import { logger } from "@/app/lib/logger";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH =
  withApiLogging(
    async (
      req: Request,
      {
        params,
      }: {
        params: Promise<{
          conversationId: string;
        }>;
      }
    ) => {
      try {
        verifyOrigin(req);

        const { conversationId } =
          await params;

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

        const conversationResult =
          await conversationService.closeConversation(
            conversationId,
            access.userId,
            access.session?.user.role ??
              "CUSTOMER"
          );

        try {
          await Promise.all([
            pusherServer.trigger(
              conversationId,
              "new-message",
              conversationResult.systemMessage
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
          logger.error(
            "PUSHER_ERROR:",
            error
          );
        }

        return NextResponse.json(
          {
            success: true,
            conversation:
              conversationResult.conversation,
            message:
              conversationResult.systemMessage,
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        return handleApiError(error);
      }
    }
  );