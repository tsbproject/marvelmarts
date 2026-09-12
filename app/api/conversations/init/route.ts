import { NextRequest, NextResponse } from "next/server";
import {
  ConversationParticipantContext,
  ConversationType,
} from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      const session = await requireAuth();

      const { targetUserId, type, subject } = await req.json();

      if (!targetUserId) {
        throw badRequest("Target vendor is required.");
      }

      // This endpoint is deliberately customer-context only.
      // The browser must not be allowed to select an arbitrary context.
      if (type !== ConversationType.CUSTOMER_VENDOR) {
        throw badRequest("Invalid conversation type.");
      }

      const vendor = await prisma.vendorProfile.findUnique({
        where: {
          id: targetUserId,
        },
        select: {
          userId: true,
        },
      });

      if (!vendor?.userId) {
        throw notFound("Target vendor not found.");
      }

      const customerUserId = session.user.id;
      const vendorUserId = vendor.userId;

      if (customerUserId === vendorUserId) {
        throw forbidden("You cannot start a conversation with yourself.");
      }

      // Context, rather than User.roles, defines which side of the
      // dual-role account owns this conversation.
      let conversation = await prisma.conversation.findFirst({
        where: {
          type: ConversationType.CUSTOMER_VENDOR,
          participantContexts: {
            some: {
              userId: customerUserId,
              context: ConversationParticipantContext.CUSTOMER,
            },
          },
          AND: {
            participantContexts: {
              some: {
                userId: vendorUserId,
                context: ConversationParticipantContext.VENDOR,
              },
            },
          },
        },
      });

      if (conversation) {
        // Repair a legacy conversation's context rows when the two
        // participants are unambiguously known from this request.
        await prisma.conversationParticipant.createMany({
          data: [
            {
              conversationId: conversation.id,
              userId: customerUserId,
              context: ConversationParticipantContext.CUSTOMER,
            },
            {
              conversationId: conversation.id,
              userId: vendorUserId,
              context: ConversationParticipantContext.VENDOR,
            },
          ],
          skipDuplicates: true,
        });

        return NextResponse.json(
          {
            success: true,
            conversationId: conversation.id,
          },
          { status: 200 }
        );
      }

      // Transitional lookup for conversations created before
      // ConversationParticipant.context existed.
      const legacyConversation = await prisma.conversation.findFirst({
        where: {
          type: ConversationType.CUSTOMER_VENDOR,
          participantIds: {
            hasEvery: [customerUserId, vendorUserId],
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (legacyConversation) {
        await prisma.conversationParticipant.createMany({
          data: [
            {
              conversationId: legacyConversation.id,
              userId: customerUserId,
              context: ConversationParticipantContext.CUSTOMER,
            },
            {
              conversationId: legacyConversation.id,
              userId: vendorUserId,
              context: ConversationParticipantContext.VENDOR,
            },
          ],
          skipDuplicates: true,
        });

        return NextResponse.json(
          {
            success: true,
            conversationId: legacyConversation.id,
          },
          { status: 200 }
        );
      }

      conversation = await prisma.conversation.create({
        data: {
          type: ConversationType.CUSTOMER_VENDOR,
          subject: subject?.trim() || "Product Inquiry",
          participantIds: [customerUserId, vendorUserId],
          participants: {
            connect: [
              { id: customerUserId },
              { id: vendorUserId },
            ],
          },
          participantContexts: {
            create: [
              {
                userId: customerUserId,
                context: ConversationParticipantContext.CUSTOMER,
              },
              {
                userId: vendorUserId,
                context: ConversationParticipantContext.VENDOR,
              },
            ],
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          conversationId: conversation.id,
        },
        { status: 200 }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
