import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { MessageService } from "@/app/lib/services/message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session =
      await requireVendor();

    const conversations =
      await MessageService.getUserConversations(
        session.user.id
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