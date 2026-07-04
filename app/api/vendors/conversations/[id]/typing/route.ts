import { NextRequest, NextResponse } from "next/server";

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

    const body = await req.json();

    await pusherServer.trigger(
      `chat-${conversationId}`,
      "typing",
      {
        userId: access.userId,
        typing: !!body.typing,
      }
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}