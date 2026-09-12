import crypto from "crypto";

import type { Session } from "next-auth";
import type { Conversation } from "@prisma/client";
import {
  ConversationParticipantContext,
} from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

import { conversationService } from "./conversation.service";

import type { ConversationAccess } from "@/app/lib/auth/conversation";
import { logger } from "@/app/lib/logger";
import { hasPermission, isSuperAdmin } from "@/app/lib/auth/authorization";



import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

interface CustomerMessageInput {
  content: string;

  recipientId?: string;

  conversationId?: string;

  productId?: string | null;

  productPrice?: string | null;

  productImage?: string | null;

  visitorName?: string;

  visitorEmail?: string;

  guestAccessToken?: string;
}

interface SenderInfo {
  senderId: string | null;
  senderName: string;
}

interface ConversationContext {
  conversation: Conversation;
  vendorUserId: string | null;
}

type ConversationEntity =
  | Conversation
  | (Omit<Conversation, "guestAccessToken" | "deletedForUserIds"> & {
      participants?: unknown[];
    });

export class ConversationDomainService {

  static async sendCustomerMessage(
  session: Session | null,
  body: CustomerMessageInput
) {
  const context =
    await this.resolveConversation(
      session,
      body
    );

  const sender =
    this.resolveSender(
      session,
      context.conversation,
      body
    );



  const message =
    await this.sendConversationMessage(
      context.conversation,
      sender,
      body
    );

  await this.broadcastCustomerMessage(
    context.conversation,
    context.vendorUserId,
    message,
    sender.senderName
  );

  return {
    success: true,
    message,
    conversation: context.conversation,
    conversationId:
      context.conversation.id,
    guestAccessToken:
      context.conversation
        .guestAccessToken ?? null,
    status:
      context.conversation.status,
  };


}


static async sendMessage(
  access: ConversationAccess,
  body: {
    content: string;
  }
) {
  const {
    session,
    conversation,
    userId,
  } = access;

  const vendorUserId =

    await prisma.conversationParticipant
      .findFirst({
        where: {
          conversationId: conversation.id,
          context: ConversationParticipantContext.VENDOR,
        },
        select: {
          userId: true,
        },
      })
      .then((vendorContext) =>
        vendorContext?.userId ?? null
      );

  const sender =
    this.resolveSender(
      session,
      conversation,
      {
        content: body.content,
      }
    );

  const message =
    await this.sendConversationMessage(
      conversation,
      {
        senderId: userId,
        senderName:
          sender.senderName,
      },
      {
        content: body.content,
      }
    );

  await this.broadcastCustomerMessage(
    conversation,
    vendorUserId,
    message,
    sender.senderName
  );

  return {
    success: true,
    message,
    conversationId:
      conversation.id,
    guestAccessToken:
      conversation.guestAccessToken ??
      null,
    status:
      conversation.status,
  };
}






 private static async resolveConversation(
  session: Session | null,
  body: CustomerMessageInput
): Promise<ConversationContext> {
  const {
    conversationId,
    recipientId,
    visitorName,
    visitorEmail,
    guestAccessToken,
  } = body;

  let conversation: Conversation;
  let vendorUserId: string | null = null;

  /* ---------------------------------------------------------------------- */
  /* EXISTING CONVERSATION                                                   */
  /* ---------------------------------------------------------------------- */

  if (conversationId) {
    const existing =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });

    if (!existing) {
      throw notFound(
        "Conversation not found."
      );
    }

    if (existing.status === "CLOSED") {
      throw forbidden(
        "This conversation has already been closed."
      );
    }

    if (session?.user?.id) {
    const customerContext =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId_context: {
            conversationId: existing.id,
            userId: session.user.id,
            context: ConversationParticipantContext.CUSTOMER,
          },
        },
        select: {
          id: true,
        },
      });

    if (!customerContext) {
      throw forbidden(
        "Unauthorized conversation access."
      );
    }

    const vendorContext =
      await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: existing.id,
          context: ConversationParticipantContext.VENDOR,
        },
        select: {
          userId: true,
        },
      });

    vendorUserId =
      vendorContext?.userId ?? null;
    } else {
      if (!existing.isGuest) {
        throw forbidden(
          "Guest access is not allowed."
        );
      }

      if (
        guestAccessToken !==
        existing.guestAccessToken
      ) {
        throw forbidden(
          "Invalid guest access token."
        );
      }


    const vendorContext =
      await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: existing.id,
          context: ConversationParticipantContext.VENDOR,
        },
        select: {
          userId: true,
        },
      });

    vendorUserId =
      vendorContext?.userId ?? null;
    }

    conversation = existing;
  }

  /* ---------------------------------------------------------------------- */
  /* CREATE NEW CONVERSATION                                                 */
  /* ---------------------------------------------------------------------- */

  else {
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

          participants: {
            connect: [
              {
                id: session.user.id,
              },
              {
                id: vendorUserId,
              },
            ],
          },

          participantContexts: {
            create: [
              {
                userId: session.user.id,
                context:
                  ConversationParticipantContext.CUSTOMER,
              },
              {
                userId: vendorUserId,
                context:
                  ConversationParticipantContext.VENDOR,
              },
            ],
          },
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

            participants: {
              connect: [
                {
                  id: vendorUserId,
                },
              ],
            },

            participantContexts: {
              create: [
                {
                  userId: vendorUserId,
                  context:
                    ConversationParticipantContext.VENDOR,
                },
              ],
            },
          },
        });
    }
  }

  return {
    conversation,
    vendorUserId,
  };
}


private static async resolveExistingConversation(
  session: Session | null,
  conversationId: string,
  guestAccessToken?: string
) {
  const conversation =
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

  if (
    conversation.status ===
    "CLOSED"
  ) {
    throw forbidden(
      "This conversation has already been closed."
    );
  }

  let vendorUserId: string | null =
    null;

  if (session?.user?.id) {
    const customerContext =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId_context: {
            conversationId: conversation.id,
            userId: session.user.id,
            context: ConversationParticipantContext.CUSTOMER,
          },
        },
        select: {
          id: true,
        },
      });

    if (!customerContext) {
      throw forbidden(
        "Unauthorized conversation access."
      );
    }

    const vendorContext =
      await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: conversation.id,
          context: ConversationParticipantContext.VENDOR,
        },
        select: {
          userId: true,
        },
      });

    vendorUserId =
      vendorContext?.userId ?? null;
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


    const vendorContext =
      await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: conversation.id,
          context: ConversationParticipantContext.VENDOR,
        },
        select: {
          userId: true,
        },
      });

    vendorUserId =
      vendorContext?.userId ?? null;
  }

  return {
    conversation,
    vendorUserId,
  };
}


private static async resolveSupportConversation(
  session: Session | null,
  conversationId: string,
  email?: string
) {
  const conversation =
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

  let senderId: string | null = null;

  if (session?.user?.id) {
    const supportContext =
      conversation.type === "VENDOR_ADMIN"
        ? ConversationParticipantContext.VENDOR
        : conversation.type === "CUSTOMER_ADMIN"
          ? ConversationParticipantContext.CUSTOMER
          : null;

    const isAdmin =
      isSuperAdmin(session) ||
      hasPermission(session, "manageMessages");

    if (!isAdmin) {
      if (!supportContext) {
        throw forbidden(
          "Invalid support conversation."
        );
      }

      const participantContext =
        await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId_context: {
              conversationId: conversation.id,
              userId: session.user.id,
              context: supportContext,
            },
          },
          select: {
            id: true,
          },
        });

      if (!participantContext) {
        throw forbidden(
          "Unauthorized conversation access."
        );
      }
    }

    senderId = session.user.id;
  } else {
    if (!email?.trim()) {
      throw forbidden(
        "Email is required."
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email: email
            .trim()
            .toLowerCase(),
        },
      });

    if (!user) {
      throw forbidden(
        "This email is not registered."
      );
    }
    const supportContext =
      conversation.type === "VENDOR_ADMIN"
        ? ConversationParticipantContext.VENDOR
        : conversation.type === "CUSTOMER_ADMIN"
          ? ConversationParticipantContext.CUSTOMER
          : null;

    if (!supportContext) {
      throw forbidden(
        "Unauthorized conversation access."
      );
    }

    const participantContext =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId_context: {
            conversationId: conversation.id,
            userId: user.id,
            context: supportContext,
          },
        },
        select: {
          id: true,
        },
      });

    if (!participantContext) {
      throw forbidden(
        "Unauthorized conversation access."
      );
    }

    senderId = user.id;
  }

  const adminContext =
    await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversation.id,
        context: ConversationParticipantContext.ADMIN,
        ...(senderId
          ? {
              userId: {
                not: senderId,
              },
            }
          : {}),
      },
      select: {
        userId: true,
      },
    });

  const adminUserId =
    adminContext?.userId ?? null;

  return {
    conversation,
    senderId,
    adminUserId,
  };
}


static async sendSupportMessage(
  access: ConversationAccess,
  body: {
    content: string;
    email?: string;
  }
) {
  const {
    conversation,
    userId,
    session,
  } = access;

  const senderName =
    session?.user?.name ??
    conversation.participants.find(
      (participant) =>
        participant.id === userId
    )?.name ??
    body.email ??
    "Support User";


  const supportContext =
    access.isAdmin
      ? ConversationParticipantContext.ADMIN
      : conversation.type === "VENDOR_ADMIN"
        ? ConversationParticipantContext.VENDOR
        : ConversationParticipantContext.CUSTOMER;

  const message =
    await conversationService.sendMessage(
      conversation.id,
      userId,
      senderName,
      body.content.trim(),
      undefined,
      supportContext
    );

  await this.broadcastSupportMessage(
    conversation,
    message
  );

  return {
    success: true,
    message,
    conversationId: conversation.id,
    status: conversation.status,
  };
}

  private static resolveSender(
  session: Session | null,
  conversation: ConversationEntity,
  body: CustomerMessageInput
): SenderInfo {
  return {
    senderId:
      session?.user?.id ?? null,

    senderName:
      session?.user?.name ??
      conversation.visitorName ??
      body.visitorName?.trim() ??
      "Guest Customer",
  };
}

  private static async sendConversationMessage(
  conversation: ConversationEntity,
  sender: SenderInfo,
  body: CustomerMessageInput
) {
  return conversationService.sendMessage(
    conversation.id,
    sender.senderId,
    sender.senderName,
    body.content.trim(),
    {
      productId: body.productId,
      productPrice: body.productPrice,
      productImage: body.productImage,
    },
    sender.senderId
      ? ConversationParticipantContext.CUSTOMER
      : undefined
  );
}
  private static async broadcastSupportMessage(
    conversation: ConversationEntity,
    message: any
  ) {
    try {
      await pusherServer.trigger(
        conversation.id,
        "new-message",
        message
      );
    } catch (error) {
      logger.error(
        "Failed to broadcast support message",
        error
      );
    }
  }

 private static async broadcastCustomerMessage(
  conversation: ConversationEntity,
  vendorUserId: string | null,
  message: any,
  senderName: string
) {
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
            `user-${vendorUserId}-vendor`,
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
    logger.error(
      "PUSHER_ERROR:",
      error
    );
  }
}


}
