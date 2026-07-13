import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";
import { MessageService } from "@/app/lib/services/message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body = await req.json();

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
        session.user.id
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