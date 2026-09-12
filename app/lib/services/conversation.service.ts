import { prisma } from "@/app/lib/prisma";
import { ConversationParticipantContext } from "@prisma/client";

import { conversationRepository } from "@/app/lib/repositories/conversation.repository";

export const conversationService = {
  getConversation(conversationId: string) {
    return conversationRepository.findById(
      conversationId
    );
  },

  getMessages(conversationId: string) {
    return conversationRepository.findMessages(
      conversationId
    );
  },

  async sendMessage(
  conversationId: string,
  senderId: string | null,
  senderName: string,
  content: string,
  product?: {
    productId?: string | null;
    productPrice?: string | null;
    productImage?: string | null;
  },
  context?: ConversationParticipantContext
) {
  if (senderId && !context) {
    throw new Error(
      "Conversation context is required"
    );
  }

  if (senderId && context) {
    const participantContext =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId_context: {
            conversationId,
            userId: senderId,
            context,
          },
        },
        select: {
          id: true,
        },
      });

    if (!participantContext) {
      throw new Error(
        "Conversation context access denied"
      );
    }
  }

  return conversationRepository.createMessage({
    conversationId,
    senderId,
    senderName,
    content,
    productId: product?.productId ?? null,
    productPrice: product?.productPrice ?? null,
    productImage: product?.productImage ?? null,
  });
},

  closeConversation(
    conversationId: string,
    endedById: string,
    endedByRole: string
  ) {
    return conversationRepository.close(
      conversationId,
      endedById,
      endedByRole
    );
  },

  async deleteConversation(
    conversationId: string,
    userId: string
  ) {
    const conversation =
      await conversationRepository.markDeleted(
        conversationId,
        userId
      );

    const everyoneDeleted =
      conversation.participantIds.every(
        (participantId) =>
          conversation.deletedByParticipantIds.includes(
            participantId
          )
      );

    if (everyoneDeleted) {
      await conversationRepository.deleteForever(
        conversation.id
      );
    }

    return {
      conversation,
      everyoneDeleted,
    };
  },
};