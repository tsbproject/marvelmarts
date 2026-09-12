import { ConversationParticipantContext } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { MessageService } from "@/app/lib/services/message.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireVendor();

      const conversations =
        await MessageService.getUserConversations(
          session.user.id,
          ConversationParticipantContext.VENDOR
        );

      return NextResponse.json(
        {
          success: true,
          conversations,
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
