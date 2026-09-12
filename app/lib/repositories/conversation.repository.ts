import { prisma } from "@/app/lib/prisma";
import { ConversationParticipantContext, ConversationType } from "@prisma/client";


export const conversationRepository = {
  async findById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participantContexts: {
          select: {
            id: true,
            userId: true,
            context: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async findParticipantContext(
    conversationId: string,
    userId: string,
    context: ConversationParticipantContext
  ) {
    return prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId_context: {
          conversationId,
          userId,
          context,
        },
      },
    });
  },

  async findUserConversationsByContext(
    userId: string,
    context: ConversationParticipantContext
  ) {
    return prisma.conversation.findMany({
      where: {
        participantContexts: {
          some: {
            userId,
            context,
          },
        },
        NOT: {
          deletedByParticipantIds: {
            has: userId,
          },
        },
      },
      include: {
        participantContexts: {
          select: {
            id: true,
            userId: true,
            context: true,
            createdAt: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async createConversationWithContexts(data: {
    type: ConversationType;
    subject?: string | null;
    participantIds: string[];
    participants: Array<{
      userId: string;
      context: ConversationParticipantContext;
    }>;
  }) {
    return prisma.conversation.create({
      data: {
        type: data.type,
        subject: data.subject ?? null,
        participantIds: data.participantIds,
        participants: {
          connect: data.participantIds.map((id) => ({
            id,
          })),
        },
        participantContexts: {
          create: data.participants.map((participant) => ({
            userId: participant.userId,
            context: participant.context,
          })),
        },
      },
      include: {
        participantContexts: {
          select: {
            id: true,
            userId: true,
            context: true,
            createdAt: true,
          },
        },
      },
    });
  },
  async findMessages(conversationId: string) {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async createMessage(data: {
  conversationId: string;
  senderId: string | null;
  senderName: string;
  content: string;
  productId?: string | null;
  productPrice?: string | null;
  productImage?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        productId: data.productId ?? null,
        productPrice: data.productPrice ?? null,
        productImage: data.productImage ?? null,
      },
    });

    await tx.conversation.update({
      where: {
        id: data.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  });
},

  async close(
    conversationId: string,
    endedById: string,
    endedByRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          status: "CLOSED",
          endedAt: new Date(),
          endedById,
          endedByRole,
        },
      });

      const systemMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: "SYSTEM",
          senderName: "MarvelMarts Support",
          content:
            "This support session has been ended by an administrator.",
        },
      });

      return {
        conversation,
        systemMessage,
      };
    });
  },

  async markDeleted(
    conversationId: string,
    userId: string
  ) {
    return prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        deletedByParticipantIds: {
          push: userId,
        },
      },
      select: {
        id: true,
        participantIds: true,
        deletedByParticipantIds: true,
      },
    });
  },

  async deleteForever(
    conversationId: string
  ) {
    return prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          conversationId,
        },
      }),

      prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      }),
    ]);
  },

  async findOpenSupportConversation(
  userId: string,
  type: ConversationType
) {
  return prisma.conversation.findFirst({
    where: {
      type,
      status: "OPEN",
      participantIds: {
        has: userId,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      participants: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
},

async createSupportConversation({
  userId,
  adminId,
  type,
  subject,
  userContext,
}: {
  userId: string;
  adminId: string;
  type: ConversationType;
  subject?: string | null;
  userContext: ConversationParticipantContext;
}) {
  return prisma.conversation.create({
    data: {
      type,
      status: "OPEN",
      subject: subject ?? null,

      participantIds: [
        userId,
        adminId,
      ],

      participants: {
        connect: [
          {
            id: userId,
          },
          {
            id: adminId,
          },
        ],
      },

      participantContexts: {
        create: [
          {
            userId,
            context: userContext,
          },
          {
            userId: adminId,
            context:
              ConversationParticipantContext.ADMIN,
          },
        ],
      },
    },

    include: {
      participants: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },

      participantContexts: {
        select: {
          id: true,
          userId: true,
          context: true,
          createdAt: true,
        },
      },

      messages: true,
    },
  });
},

async createSystemMessage(
  conversationId: string,
  content: string
) {
  return prisma.message.create({
    data: {
      conversationId,
      senderId: "SYSTEM",
      senderName: "MarvelMarts Support",
      content,
    },
  });
},

async findUserConversations(
  userId: string
) {
  return prisma.conversation.findMany({
    where: {
      participantIds: {
        has: userId,
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
};
