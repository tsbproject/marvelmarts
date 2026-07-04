import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { conversationService } from "@/app/lib/services/conversation.service";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();

    const {
      content,
      recipientId,
      productId,
      productPrice,
      productImage,
      conversationId,
      visitorName,
      visitorEmail,
      guestAccessToken,
    } = body;

    if (!content?.trim()) {
      throw badRequest(
        "Message content is required."
      );
    }

    let conversation;
    let vendorUserId: string | null = null;

    if (conversationId) {
      conversation =
        await prisma.conversation.findUnique({
          where: {
            id: conversationId,
          },
        });

      if (!conversation) {
        throw notFound(
          "Conversation not found."
        );
      }

      if (conversation.status === "CLOSED") {
        throw forbidden(
          "This conversation has already been closed."
        );
      }

      if (session?.user?.id) {
        if (
          !conversation.participantIds.includes(
            session.user.id
          )
        ) {
          throw forbidden(
            "Unauthorized conversation access."
          );
        }

        vendorUserId =
          conversation.participantIds.find(
            (id) =>
              id !== session.user.id
          ) ?? null;
      } else {
        if (!conversation.isGuest) {
          throw forbidden(
            "Guest access is not allowed."
          );
        }

        if (
          guestAccessToken !==
          conversation.guestAccessToken
        ) {
          throw forbidden(
            "Invalid guest access token."
          );
        }

        vendorUserId =
          conversation.participantIds[0] ??
          null;
      }
    } else {
      if (!recipientId) {
        throw badRequest(
          "Vendor recipient is required."
        );
      }

      const vendor =
        await prisma.vendorProfile.findUnique({
          where: {
            id: recipientId,
          },
          select: {
            id: true,
            userId: true,
          },
        });

      if (!vendor?.userId) {
        throw notFound(
          "Vendor not found."
        );
      }

      vendorUserId = vendor.userId;

      if (session?.user?.id) {
        conversation =
          await prisma.conversation.create({
            data: {
              participantIds: [
                session.user.id,
                vendorUserId,
              ],
              type: "CUSTOMER_VENDOR",
              subject:
                "Product Inquiry",
              isGuest: false,
            },
          });
      } else {
        if (
          !visitorName?.trim() ||
          !visitorEmail?.trim()
        ) {
          throw badRequest(
            "Visitor name and email are required."
          );
        }

        conversation =
          await prisma.conversation.create({
            data: {
              participantIds: [
                vendorUserId,
              ],
              type: "CUSTOMER_VENDOR",
              subject:
                "Product Inquiry",
              isGuest: true,
              visitorName:
                visitorName.trim(),
              visitorEmail:
                visitorEmail
                  .trim()
                  .toLowerCase(),
              guestAccessToken:
                crypto
                  .randomBytes(24)
                  .toString("hex"),
            },
          });
      }
    }

    const senderId =
      session?.user?.id ?? null;

    const senderName =
      session?.user?.name ??
      conversation.visitorName ??
      visitorName?.trim() ??
      "Guest Customer";

    const message =
      await conversationService.sendMessage(
        conversation.id,
        senderId,
        senderName,
        content.trim(),
        {
          productId,
          productPrice,
          productImage,
        }
      );

    try {
      await Promise.all([
        pusherServer.trigger(
          conversation.id,
          "new-message",
          message
        ),

        vendorUserId
          ? pusherServer.trigger(
              `vendor-${vendorUserId}`,
              "new-inquiry",
              {
                conversationId:
                  conversation.id,
                subject:
                  conversation.subject,
                status:
                  conversation.status,
                isGuest:
                  conversation.isGuest,
                visitorName:
                  conversation.visitorName,
                visitorEmail:
                  conversation.visitorEmail,
                lastMessage:
                  message.content,
                unreadCount: 1,
                updatedAt:
                  new Date().toISOString(),
              }
            )
          : Promise.resolve(),

        vendorUserId
          ? pusherServer.trigger(
              `user-${vendorUserId}`,
              "new-message",
              {
                id: message.id,
                content:
                  message.content,
                senderName,
                conversationId:
                  conversation.id,
              }
            )
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error(
        "PUSHER_ERROR:",
        error
      );
    }

    return NextResponse.json(
      {
        success: true,
        message,
        conversationId:
          conversation.id,
        guestAccessToken:
          conversation.guestAccessToken ??
          null,
        status:
          conversation.status,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}