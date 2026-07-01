import { pusherServer } from "@/app/lib/pusherServer";

export const realtimeService = {
  async broadcastMessage(
    conversationId: string,
    message: unknown
  ) {
    return pusherServer.trigger(
      conversationId,
      "new-message",
      message
    );
  },

  async broadcastIncomingSupport(
    conversationId: string,
    message: {
      content: string;
      senderName: string | null;
      createdAt: Date;
    }
  ) {
    return pusherServer.trigger(
      "global-admin-support",
      "incoming-support-message",
      {
        conversationId,
        ...message,
      }
    );
  },

  async broadcastConversationClosed(
    conversationId: string
  ) {
    await Promise.all([
      pusherServer.trigger(
        conversationId,
        "conversation-closed",
        {
          conversationId,
          status: "CLOSED",
        }
      ),

      pusherServer.trigger(
        "global-admin-support",
        "conversation-closed",
        {
          conversationId,
          status: "CLOSED",
        }
      ),
    ]);
  },
};