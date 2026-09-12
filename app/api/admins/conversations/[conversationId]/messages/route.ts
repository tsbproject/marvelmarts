import { ConversationParticipantContext } from "@prisma/client";
import { NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";
import { pusherServer } from "@/app/lib/pusherServer";
import { logger } from "@/app/lib/logger";

import {
  requireConversationAccess,
  requireSupportConversationAccess,
} from "@/app/lib/auth/conversation";

import { handleApiError } from "@/app/lib/auth/api";

import {
  badRequest,
  forbidden,
} from "@/app/lib/auth/errors";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                              SEND MESSAGE                                  */
/* -------------------------------------------------------------------------- */

export const POST =
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

        const searchParams =
          new URL(req.url).searchParams;

        const access =
          await requireSupportConversationAccess(
            conversationId,
            searchParams.get("email") ??
              undefined
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
            "This conversation has been closed."
          );
        }

        const message =
          await conversationService.sendMessage(
            conversationId,
            access.userId,
            access.session?.user.name ??
              "Unknown User",
            content,
            undefined,
            ConversationParticipantContext.ADMIN
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
          logger.error(
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

/* -------------------------------------------------------------------------- */
/*                           GET CONVERSATION                                 */
/* -------------------------------------------------------------------------- */

export const GET =
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
        const { conversationId } =
          await params;

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
            id:
              access.conversation.id,
            status:
              access.conversation.status,
          },

          participants:
            access.conversation
              .participants,

          messages,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );
