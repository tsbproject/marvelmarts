import { NextRequest, NextResponse } from "next/server";
import { ConversationType } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const {
      targetUserId,
      type,
      subject,
    } = await req.json();

    if (!targetUserId) {
      throw badRequest(
        "Target participant is required."
      );
    }

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          id: targetUserId,
        },
        select: {
          userId: true,
        },
      });

    const participantId =
      vendor?.userId ??
      targetUserId;

    const participant =
      await prisma.user.findUnique({
        where: {
          id: participantId,
        },
        select: {
          id: true,
        },
      });

    if (!participant) {
      throw notFound(
        "Target participant not found."
      );
    }

    let conversation =
      await prisma.conversation.findFirst({
        where: {
          type:
            type as ConversationType,
          participantIds: {
            hasEvery: [
              session.user.id,
              participantId,
            ],
          },
        },
      });

    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            type:
              type as ConversationType,

            subject:
              subject ||
              "Product Inquiry",

            participantIds: [
              session.user.id,
              participantId,
            ],

            participants: {
              connect: [
                {
                  id: session.user.id,
                },
                {
                  id: participantId,
                },
              ],
            },
          },
        });
    }

    return NextResponse.json(
      {
        success: true,
        conversationId:
          conversation.id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}