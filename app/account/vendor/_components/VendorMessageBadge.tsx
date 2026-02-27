

"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { pusherClient } from "@/app/lib/pusherClient";

interface MessageBadgeProps {
  vendorProfileId: string;
  initialUnreadCount: number;
}

export default function VendorMessageBadge({ 
  vendorProfileId, 
  initialUnreadCount 
}: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Sync state if initialUnreadCount changes from server-side re-validation
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    if (!vendorProfileId) return;

    const channelName = `vendor-notifications-${vendorProfileId}`;
    
    // Subscribe to the real-time stream
    const channel = pusherClient.subscribe(channelName);

    const handleUpdate = (data: { count: number }) => {
      setUnreadCount((prev) => {
        // Play tactical audio cue ONLY if new count is higher than previous
        if (data.count > prev) {
          const audio = new Audio("/sounds/ping.mp3");
          audio.play().catch(() => {
            // Silently fail if browser blocks auto-play
          });
        }
        return data.count;
      });
    };

    // Bind to the unread-update event
    channel.bind("notification:unread-update", handleUpdate);

    // Cleanup protocol
    return () => {
      pusherClient.unsubscribe(channelName);
      channel.unbind("notification:unread-update", handleUpdate);
    };
    // Removed unreadCount from dependencies to prevent subscription flickering
  }, [vendorProfileId]);

  return (
    <div className="relative inline-flex items-center group">
      <MessageSquare 
        size={20} 
        className={`transition-colors duration-300 ${
          unreadCount > 0 ? "text-[#F7931E]" : "text-gray-400 group-hover:text-[#002B5B]"
        }`} 
      />
      
      {unreadCount > 0 && (
        <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F7931E] text-[10px] font-black text-white ring-2 ring-white shadow-sm animate-in zoom-in fade-in duration-300">
          <span className="absolute inset-0 rounded-full bg-[#F7931E] animate-ping opacity-20" />
          <span className="relative">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </span>
      )}
    </div>
  );
}