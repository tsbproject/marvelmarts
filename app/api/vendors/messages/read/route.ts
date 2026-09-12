import { ConversationParticipantContext } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { MessageService } from "@/app/lib/services/message.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const body =
        await req.json();

      const conversationId =
        body.conversationId;

      if (!conversationId) {
        throw badRequest(
          "Conversation ID is required."
        );
      }

      const result =
        await MessageService.markConversationAsRead(
          conversationId,
          session.user.id,
          ConversationParticipantContext.VENDOR
        );

      return NextResponse.json(
        {
          success: true,
          updated: result.count,
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
