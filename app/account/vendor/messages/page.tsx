"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { pusherClient } from "@/app/lib/pusherClient";
import Link from "next/link";
import { useNotification } from "@/app/_context/NotificationContext";

interface Conversation {
  id: string;
  subject: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage?: string;
  messages?: any[];
}

export default function VendorInbox({ vendorProfileId }: { vendorProfileId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status: authStatus } = useSession();
  const { notifyError } = useNotification();

  const fetchConversations = useCallback(async () => {
    if (authStatus !== "authenticated") return;

    try {
      setLoading(true);
      const res = await fetch(`/api/vendors/conversations`);
      if (!res.ok) throw new Error("Fetch failed");
      
      const data = await res.json();
      
      const transformedData = data.map((conv: any) => ({
        ...conv,
        // Fallback chain to ensure we always show the latest text
        lastMessage: conv.messages?.[0]?.content || conv.lastMessage || "No messages yet"
      }));

      setConversations(transformedData);
    } catch (error) {
      console.error("Inbox Error:", error);
      notifyError("Failed to sync with the communication grid.");
    } finally {
      setLoading(false);
    }
  }, [authStatus, notifyError]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated") {
      setLoading(false);
      return;
    }

    // TACTICAL FIX: Use the vendor's actual ID from the profile or session
    const activeId = vendorProfileId || session?.user?.id;
    if (!activeId) return;

    fetchConversations();

    // REAL-TIME HANDSHAKE
    // Ensure your server-side triggers to "vendor-{vendorId}"
    const channelName = `vendor-${activeId}`;
    const channel = pusherClient.subscribe(channelName);
    
    // Listen for both a brand new inquiry and updates to existing ones
    const handleUpdate = (payload: any) => {
      setConversations(prev => {
        // Remove the old version of this conversation if it exists
        const filtered = prev.filter(c => c.id !== payload.id);
        
        const transformedPayload = {
          ...payload,
          lastMessage: payload.content || payload.messages?.[0]?.content || "New message received",
          updatedAt: new Date().toISOString()
        };
        
        // Move to the top of the list
        return [transformedPayload, ...filtered];
      });
    };

    channel.bind("new-inquiry", handleUpdate);
    channel.bind("conversation-update", handleUpdate);

    return () => {
      pusherClient.unsubscribe(channelName);
      channel.unbind_all();
    };
  }, [vendorProfileId, session?.user?.id, authStatus, fetchConversations]);

  if (authStatus === "unauthenticated") {
    return (
      <div className="p-6 text-red-500 font-black uppercase text-[10px] tracking-tighter bg-red-50/50 rounded-2xl border border-red-100">
        Signal Lost: Please Sign In Again
      </div>
    );
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 bg-white m-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 border-[3px] border-gray-100 border-t-[#F7931E] rounded-full animate-spin" />
          <div className="absolute h-2 w-2 bg-[#002B5B] rounded-full animate-pulse" />
        </div>
        <div className="text-[10px] font-black uppercase text-[#002B5B] tracking-[0.2em] animate-pulse">
          Scanning Waves...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black italic uppercase text-[#002B5B]">Incoming Comms</h2>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          CH: {vendorProfileId?.slice(-8).toUpperCase() || "GLOBAL"}
        </span>
      </div>
      
      {conversations.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
          <div className="mb-4 flex justify-center">
            <div className="h-1.5 w-12 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase text-gray-400 italic tracking-[0.2em]">
            No active transmissions found
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/account/vendor/messages/${chat.id}`}
              className="group relative block p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:border-[#F7931E]/40 hover:shadow-2xl hover:shadow-[#002B5B]/5 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F7931E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5 max-w-[80%]">
                  <span className="font-black text-[#002B5B] uppercase text-sm tracking-tight group-hover:text-[#F7931E] transition-colors duration-300">
                    {chat.subject || "Unknown Inquiry"}
                  </span>
                  <p className="text-[11px] text-gray-500 line-clamp-1 italic font-medium leading-relaxed">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                      Synced: {new Date(chat.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
                
                {chat.unreadCount > 0 && (
                  <div className="flex flex-col items-end">
                    <span className="bg-[#F7931E] text-white text-[8px] px-2.5 py-1 rounded-full font-black animate-bounce shadow-lg shadow-[#F7931E]/30 tracking-tighter">
                      {chat.unreadCount} NEW
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}