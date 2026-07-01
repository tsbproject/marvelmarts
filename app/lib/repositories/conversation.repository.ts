import { prisma } from "@/app/lib/prisma";

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
    senderId: string;
    senderName: string;
    content: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data,
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
};