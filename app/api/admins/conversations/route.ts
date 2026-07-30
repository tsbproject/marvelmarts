import { ConversationType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { MessageService } from "@/app/lib/services/message.service";
import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  type: z.nativeEnum(ConversationType).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      type: searchParams.get("type") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters.",
          errors: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const conversations =
      await MessageService.getConversations(
        session.user.id,
        parsed.data.type
      );

    return NextResponse.json(conversations);
  } catch (error) {
    return handleApiError(error);
  }
}