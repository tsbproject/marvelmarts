


"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/app/lib/pusherClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

interface Participant {
  id: string;
  name: string | null;
  role: string;
  vendorProfile?: {
    id: string;
  } | null;
}

interface ChatMessagePreview {
  id?: string;
  content: string | null;
  createdAt?: string | Date;
  senderName?: string | null;
}

interface ConversationItem {
  id: string;
  type: string;
  status?: "OPEN" | "CLOSED";
  updatedAt?: string | Date;
  participants?: Participant[];
  messages?: ChatMessagePreview[];
}

export default function ChatList({
  conversations: initialConversations,
}: {
  conversations: ConversationItem[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { notifySuccess } = useNotification();

  useEffect(() => {
    setConversations(initialConversations);

    const globalChannel = pusherClient.subscribe("global-admin-support");

    const handleIncomingSupportMessage = (data: {
      conversationId: string;
      content: string;
      senderName: string;
      createdAt?: string;
    }) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === data.conversationId);

        if (!exists) {
          return prev;
        }

        return prev
          .map((c) =>
            c.id === data.conversationId
              ? {
                  ...c,
                  status: c.status ?? "OPEN",
                  messages: [{ content: data.content }],
                  updatedAt: data.createdAt || new Date().toISOString(),
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || 0).getTime() -
              new Date(a.updatedAt || 0).getTime()
          );
      });

      if (selectedId !== data.conversationId) {
        notifySuccess(`New message from ${data.senderName}`);
      }
    };

    const handleConversationClosed = (data: {
      conversationId: string;
      status: "CLOSED";
    }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                status: "CLOSED",
                messages: [{ content: "This support session has been closed." }],
              }
            : c
        )
      );
    };

    globalChannel.bind("incoming-support-message", handleIncomingSupportMessage);
    globalChannel.bind("conversation-closed", handleConversationClosed);

    return () => {
      globalChannel.unbind("incoming-support-message", handleIncomingSupportMessage);
      globalChannel.unbind("conversation-closed", handleConversationClosed);
      pusherClient.unsubscribe("global-admin-support");
    };
  }, [initialConversations, selectedId, notifySuccess]);

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((chat) => {
        const targetParticipant =
          chat.participants?.find(
            (p) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
          ) || null;

        const isClosed = chat.status === "CLOSED";

        return (
          <Link
            key={chat.id}
            href={`/dashboard/admins/support/messages?type=${chat.type}&id=${chat.id}`}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
              selectedId === chat.id
                ? "bg-[#002B5B] text-white"
                : "bg-white text-[#002B5B]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              <User size={24} className="text-[#F7931E]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs uppercase truncate">
                  {targetParticipant?.name || "Support Ticket"}
                </h4>

                {isClosed && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${
                      selectedId === chat.id
                        ? "border-white/30 text-white/90"
                        : "border-red-200 text-red-500 bg-red-50"
                    }`}
                  >
                    Closed
                  </span>
                )}
              </div>

              <p className="text-[11px] truncate opacity-70">
                {isClosed
                  ? "This support session has been closed."
                  : chat.messages?.[0]?.content || "No messages yet"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}