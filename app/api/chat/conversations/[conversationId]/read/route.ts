import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireConversationAccess } from "@/app/lib/auth/conversation";
import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withApiLogging(
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

      const access =
        await requireConversationAccess(
          conversationId
        );

      const result =
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: {
              not: access.userId,
            },
            isRead: false,
          },
          data: {
            isRead: true,
          },
        });

      return NextResponse.json(
        {
          success: true,
          count: result.count,
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