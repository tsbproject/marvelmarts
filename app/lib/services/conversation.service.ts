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

  sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string
  ) {
    return conversationRepository.createMessage({
      conversationId,
      senderId,
      senderName,
      content,
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