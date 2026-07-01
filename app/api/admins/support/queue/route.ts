import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManageSupport } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireManageSupport();

    const openTickets = await prisma.conversation.count({
      where: {
        updatedAt: {
          gte: new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    return NextResponse.json({
      success: true,
      openTickets,
    });

  } catch (error) {
    return handleApiError(error);
  }
}