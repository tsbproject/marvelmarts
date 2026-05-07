"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/app/lib/pusherClient";
import {
  Send,
  ShieldCheck,
  Clock,
  Loader2,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import DisputeModal from "./DisputeModal";
import { useNotification } from "@/app/_context/NotificationContext";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
}

const CANNED_RESPONSES = [
  {
    label: "Request Proof",
    text: "Please provide clear photos or video evidence to support your claim so we can proceed with the investigation.",
  },
  {
    label: "Final Warning",
    text: "Your account is currently under review for a policy violation. Further infractions will lead to permanent suspension.",
  },
  {
    label: "Refund Approved",
    text: "We have reviewed the dispute and approved a refund. The funds should reflect in the customer's balance shortly.",
  },
  {
    label: "Dispute Closed",
    text: "This dispute has been marked as resolved. If you have further questions, please open a new support ticket.",
  },
];

function dedupeMessages(list: Message[]) {
  const seen = new Map<string, Message>();

  for (const msg of list) {
    if (!msg?.id) continue;
    seen.set(msg.id, msg);
  }

  return Array.from(seen.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export default function AdminChatThread({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showCanned, setShowCanned] = useState(false);
  const [targetUser, setTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pusherClient = getPusherClient();

  const { notifyError, notifySuccess } = useNotification();

  const safeMessages = useMemo(() => dedupeMessages(messages), [messages]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!conversationId) return;

      setLoading(true);

      try {
        const res = await fetch(`/api/admins/conversations/${conversationId}/messages`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);

          if (res.status === 404) {
            notifyError(data?.error || "This thread is no longer available.");
            router.push("/dashboard/admins/support/messages");
            router.refresh();
            return;
          }

          throw new Error(data?.error || "Failed to fetch");
        }

        const data = await res.json();

        const msgs = Array.isArray(data) ? data : data.messages || [];
        setMessages(dedupeMessages(msgs));

        const participants: Participant[] = Array.isArray(data?.participants)
          ? data.participants
          : [];

        const target = participants.find(
          (p) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
        );

        if (target) {
          setTargetUser({ id: target.id, name: target.name });
        } else {
          setTargetUser(null);
        }

        const status = data?.conversation?.status;
        setIsClosed(status === "CLOSED");
      } catch (error) {
        notifyError("Failed to decrypt secure thread.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    if (!conversationId) return;

    const channel = pusherClient.subscribe(conversationId);

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => dedupeMessages([...prev, msg]));
    };

    const handleConversationClosed = () => {
      setIsClosed(true);
      setShowCanned(false);
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("conversation-closed", handleConversationClosed);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("conversation-closed", handleConversationClosed);
      pusherClient.unsubscribe(conversationId);
    };
  }, [conversationId, notifyError, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [safeMessages, isClosed]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !conversationId || isClosed) return;

    const tempInput = input.trim();
    setInput("");
    setShowCanned(false);

    try {
      const res = await fetch(`/api/admins/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempInput }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setInput(tempInput);

        if (data?.error === "This conversation has been closed.") {
          setIsClosed(true);
          notifyError("This support session has already been closed.");
          return;
        }

        if (res.status === 404) {
          notifyError(data?.error || "This conversation is no longer available.");
          router.push("/dashboard/admins/support/messages");
          router.refresh();
          return;
        }

        notifyError(data?.error || "Transmission interrupted. Retry sent.");
      }
    } catch (error) {
      setInput(tempInput);
      notifyError("Connection failed.");
    }
  };

  const handleEndChat = async () => {
    if (!conversationId || isClosed || isEndingChat) return;

    const confirmed = window.confirm(
      "Are you sure you want to end this support chat?"
    );

    if (!confirmed) return;

    try {
      setIsEndingChat(true);

      const res = await fetch(
        `/api/admins/conversations/${conversationId}/close`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to end chat");
      }

      setIsClosed(true);
      setShowCanned(false);
      notifySuccess("Support chat ended successfully.");
    } catch (error) {
      notifyError("Failed to end chat.");
    } finally {
      setIsEndingChat(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationId || !isClosed || isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this closed chat from your list?"
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const res = await fetch(
        `/api/admins/conversations/${conversationId}/delete`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete chat");
      }

      notifySuccess("Chat removed from your list.");
      router.push("/dashboard/admins/support/messages");
      router.refresh();
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : "Failed to delete chat."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white h-[600px]">
        <Loader2 className="animate-spin text-[#F7931E]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Decrypting Secure Thread...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white relative rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight">
              Support Intervention
            </h3>
            <p
              className={`text-[9px] font-bold uppercase flex items-center gap-1 ${
                isClosed ? "text-red-500" : "text-emerald-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isClosed ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                }`}
              />
              {isClosed ? "Channel Closed" : "Live Secure Channel"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {targetUser && (
            <DisputeModal
              vendorProfileId={targetUser.id}
              vendorName={targetUser.name}
            />
          )}

          {!isClosed && (
            <button
              type="button"
              onClick={handleEndChat}
              disabled={isEndingChat}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isEndingChat ? "Ending..." : "End Chat"}
            </button>
          )}

          {isClosed && (
            <button
              type="button"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase hover:bg-red-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Chat
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FBFBFB] no-scrollbar">
        {safeMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
            <MessageSquare size={48} />
            <p className="text-[10px] font-black uppercase mt-2">
              No transmission data
            </p>
          </div>
        )}

        {safeMessages.map((msg, idx) => {
          const senderName = msg.senderName || "";

          const isAdmin =
            senderName.includes("Support") ||
            senderName === "SYSTEM" ||
            msg.senderId === session?.user?.id;

          const isSystemAction =
            senderName === "SYSTEM_ENFORCEMENT" || senderName === "SYSTEM";

          return (
            <div
              key={msg.id || `fallback-${idx}`}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`group flex flex-col ${
                  isAdmin ? "items-end" : "items-start"
                } max-w-[80%]`}
              >
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">
                    {senderName || "Unknown"}
                  </span>
                  <span className="text-[9px] font-bold text-neutral-300">
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "--:--"}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    isSystemAction
                      ? "bg-red-50 border border-red-100 text-red-700 italic font-medium w-full text-center"
                      : isAdmin
                      ? "bg-[#002B5B] text-white rounded-tr-none shadow-indigo-200/50"
                      : "bg-white border border-neutral-100 text-[#002B5B] rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef} className="h-2" />
      </div>

      <div className="p-6 bg-white border-t border-neutral-50 relative">
        {showCanned && !isClosed && (
          <div className="absolute bottom-full left-6 mb-4 w-80 bg-white border border-neutral-100 shadow-2xl rounded-3xl p-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[8px] font-black text-neutral-400 uppercase p-2 tracking-widest border-b border-neutral-50 mb-2">
              Command Center Presets
            </p>
            <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
              {CANNED_RESPONSES.map((resp) => (
                <button
                  key={resp.label}
                  type="button"
                  onClick={() => {
                    setInput(resp.text);
                    setShowCanned(false);
                  }}
                  className="w-full text-left p-3 hover:bg-neutral-50 rounded-2xl transition-colors group"
                >
                  <p className="text-[10px] font-black text-[#002B5B] uppercase tracking-tight group-hover:text-[#F7931E]">
                    {resp.label}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate font-medium">
                    {resp.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isClosed && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
              This support session has been closed
            </p>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCanned((prev) => !prev)}
            disabled={isClosed}
            className={`p-4 rounded-2xl transition-all ${
              showCanned
                ? "bg-[#F7931E] text-white shadow-inner"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            } disabled:opacity-50 disabled:hover:bg-neutral-100`}
          >
            <MessageSquare size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isClosed
                  ? "This support session has been closed"
                  : "Type official MarvelMarts response..."
              }
              disabled={isClosed}
              className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-[#002B5B]/10 transition-all outline-none disabled:opacity-60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300">
              <Clock size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isClosed}
            className="bg-[#002B5B] text-white p-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}