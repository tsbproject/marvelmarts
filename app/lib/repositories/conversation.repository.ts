import { prisma } from "@/app/lib/prisma";
import { ConversationType } from "@prisma/client";


export const conversationRepository = {
  async findById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: {
        id: conversationId,
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

async createSupportConversation(data: {
  userId: string;
  adminId: string;
  type: ConversationType;
  subject: string;
}) {
  return prisma.conversation.create({
    data: {
      type: data.type,
      status: "OPEN",
      subject: data.subject,
      participantIds: [
        data.userId,
        data.adminId,
      ],
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          role: true,
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