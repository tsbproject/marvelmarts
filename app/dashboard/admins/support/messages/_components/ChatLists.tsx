// "use client";

// import { useEffect, useState } from "react";
// import { pusherClient } from "@/app/lib/pusherClient";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { User } from "lucide-react";

// export default function ChatList({ conversations: initialConversations }: { conversations: any[] }) {
//   const [conversations, setConversations] = useState(initialConversations);
//   const searchParams = useSearchParams();
//   const selectedId = searchParams.get("id");
//   const activeType = searchParams.get("type");

//   useEffect(() => {
//     // 1. Sync state with initial server data
//     setConversations(initialConversations);

//     // 2. Subscribe to the global admin channel for new tickets
//     const channel = pusherClient.subscribe("global-admin-channel");
    
//     // Listen for brand new conversations
//     channel.bind("new-support-ticket", (newChat: any) => {
//       // Only add to list if it matches the current filter (VENDOR_ADMIN vs CUSTOMER_ADMIN)
//       if (newChat.type === activeType) {
//         setConversations((prev) => {
//           if (prev.find(c => c.id === newChat.id)) return prev;
//           return [newChat, ...prev];
//         });
//       }
//     });

//     // 3. Listen for message updates globally to refresh the "last message" snippet
//     // We bind to each conversation's private channel or use a naming convention
//     conversations.forEach((chat) => {
//       const msgChannel = pusherClient.subscribe(chat.id);
//       msgChannel.bind("new-message", (msg: any) => {
//         setConversations((prev) => 
//           prev.map((c) => 
//             c.id === chat.id ? { ...c, messages: [msg], updatedAt: new Date().toISOString() } : c
//           ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
//         );
//       });
//     });

//     return () => { 
//       pusherClient.unsubscribe("global-admin-channel"); 
//       conversations.forEach((chat) => pusherClient.unsubscribe(chat.id));
//     };
//   }, [initialConversations, activeType]);

//   return (
//     <div className="flex flex-col gap-2">
//       {conversations.length === 0 && (
//         <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
//           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No Active Transmissions</p>
//         </div>
//       )}

//       {conversations.map((chat) => {
//         const isActive = selectedId === chat.id;
        
//         // Find the User/Vendor (not the Admin)
//         const otherParticipant = chat.participants?.find(
//           (p: any) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
//         );

//         return (
//           <Link
//             key={chat.id}
//             // CRITICAL FIX: Added /live to the path to prevent Article Page redirection
//             href={`/dashboard/admins/support/messages?type=${chat.type}&id=${chat.id}`}
//             className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
//               isActive 
//                 ? "bg-[#002B5B] border-[#002B5B] text-white shadow-lg scale-[1.02]" 
//                 : "bg-white border-gray-100 text-[#002B5B] hover:border-[#F7931E]"
//             }`}
//           >
//             <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
//               isActive ? "bg-[#F7931E] text-white" : "bg-gray-50 text-[#F7931E]"
//             }`}>
//               <User size={24} />
//             </div>
            
//             <div className="flex-1 min-w-0">
//               <div className="flex justify-between items-center mb-1">
//                 <h4 className="font-black text-xs uppercase tracking-tight truncate">
//                   {otherParticipant?.name || "Support Ticket"}
//                 </h4>
//                 <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
//                   isActive ? "bg-white/10 text-[#F7931E]" : "bg-gray-100 text-gray-400"
//                 }`}>
//                   {chat.type === "VENDOR_ADMIN" ? "Vendor" : "Customer"}
//                 </span>
//               </div>
//               <p className={`text-[11px] font-medium truncate ${isActive ? "text-white/70" : "text-gray-500"}`}>
//                 {chat.messages?.[0]?.content || "New Request Initialization..."}
//               </p>
//             </div>
//           </Link>
//         );
//       })}
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/app/lib/pusherClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function ChatList({ conversations: initialConversations }: { conversations: any[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { notifySuccess } = useNotification();

  useEffect(() => {
    setConversations(initialConversations);

    // 1. Listen for messages across ALL conversations for the sidebar preview
    const globalChannel = pusherClient.subscribe("global-admin-support");
    
    globalChannel.bind("incoming-support-message", (data: any) => {
      setConversations((prev) => {
        const exists = prev.find(c => c.id === data.conversationId);
        
        if (exists) {
          // Update the preview of the existing chat and move to top
          return prev.map(c => 
            c.id === data.conversationId 
              ? { ...c, messages: [{ content: data.content }], updatedAt: new Date().toISOString() } 
              : c
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return prev; // If it's a brand new chat, wait for the 'new-ticket' trigger
      });

      if (selectedId !== data.conversationId) {
        notifySuccess(`New message from ${data.senderName}`);
      }
    });

    return () => {
      pusherClient.unsubscribe("global-admin-support");
    };
  }, [initialConversations, selectedId]);

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((chat) => (
        <Link
          key={chat.id}
          href={`/dashboard/admins/support/messages?type=${chat.type}&id=${chat.id}`}
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
            selectedId === chat.id ? "bg-[#002B5B] text-white" : "bg-white text-[#002B5B]"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <User size={24} className="text-[#F7931E]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-xs uppercase truncate">
              {chat.participants?.find((p: any) => p.role !== "ADMIN")?.name || "Support Ticket"}
            </h4>
            <p className="text-[11px] truncate opacity-70">
              {chat.messages?.[0]?.content || "No messages yet"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}