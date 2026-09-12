import { ConversationParticipantContext } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { conversationService } from "@/app/lib/services/conversation.service";
import { ConversationDomainService } from "@/app/lib/services/conversation-domain.service";

import {
  requireConversationAccess,
  requireSupportConversationAccess,
} from "@/app/lib/auth/conversation";

import { handleApiError } from "@/app/lib/auth/api";
import { notFound } from "@/app/lib/auth/errors";
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
        conversationId: string;
      }>;
    }
  ) => {
    try {
      const { conversationId } =
        await params;

      const body =
        await req.json();

      const conversation =
        await conversationService.getConversation(
          conversationId
        );

      if (!conversation) {
        throw notFound(
          "Conversation not found."
        );
      }

      const access =
        conversation.type ===
          "CUSTOMER_ADMIN" ||
        conversation.type ===
          "VENDOR_ADMIN"
          ? await requireSupportConversationAccess(
              conversationId,
              body.email
            )
          : await requireConversationAccess(
              conversationId
            );

      const result =
        conversation.type ===
          "CUSTOMER_ADMIN" ||
        conversation.type ===
          "VENDOR_ADMIN"
          ? await ConversationDomainService.sendSupportMessage(
              access,
              body
            )
          : await ConversationDomainService.sendMessage(
              access,
              body
            );

      return NextResponse.json(
        result,
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
