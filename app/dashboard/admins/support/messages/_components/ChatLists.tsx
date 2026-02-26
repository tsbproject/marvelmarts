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
import { useDispatch } from "react-redux";
import { setActiveConversation, fetchVendorDetails, clearSelectedVendor } from "@/store/chatSlice";
import { AppDispatch } from "@//store";

export default function ChatList({ conversations: initialConversations }: { conversations: any[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  
  const selectedId = searchParams.get("id");
  const activeType = searchParams.get("type");

  // Handle Redux updates whenever the URL ID changes
  useEffect(() => {
    if (selectedId) {
      dispatch(setActiveConversation(selectedId));
      
      const activeChat = conversations.find(c => c.id === selectedId);
      const vendor = activeChat?.participants?.find((p: any) => p.role === "VENDOR");

      if (vendor && activeChat.type === "VENDOR_ADMIN") {
        dispatch(fetchVendorDetails(vendor.id));
      } else {
        dispatch(clearSelectedVendor());
      }
    }
  }, [selectedId, conversations, dispatch]);

  useEffect(() => {
    setConversations(initialConversations);

    const channel = pusherClient.subscribe("global-admin-channel");
    
    channel.bind("new-support-ticket", (newChat: any) => {
      if (newChat.type === activeType) {
        setConversations((prev) => {
          if (prev.find(c => c.id === newChat.id)) return prev;
          return [newChat, ...prev];
        });
      }
    });

    conversations.forEach((chat) => {
      const msgChannel = pusherClient.subscribe(chat.id);
      msgChannel.bind("new-message", (msg: any) => {
        setConversations((prev) => 
          prev.map((c) => 
            c.id === chat.id ? { ...c, messages: [msg], updatedAt: new Date().toISOString() } : c
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
      });
    });

    return () => { 
      pusherClient.unsubscribe("global-admin-channel"); 
      conversations.forEach((chat) => pusherClient.unsubscribe(chat.id));
    };
  }, [initialConversations, activeType, conversations.length]); // Added length check for dynamic subscription cleanup

  return (
    <div className="flex flex-col gap-2">
      {conversations.length === 0 && (
        <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No Active Transmissions</p>
        </div>
      )}

      {conversations.map((chat) => {
        const isActive = selectedId === chat.id;
        
        const otherParticipant = chat.participants?.find(
          (p: any) => p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
        );

        return (
          <Link
            key={chat.id}
            href={`/dashboard/admins/support/messages?type=${chat.type}&id=${chat.id}`}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
              isActive 
                ? "bg-[#002B5B] border-[#002B5B] text-white shadow-lg scale-[1.02]" 
                : "bg-white border-gray-100 text-[#002B5B] hover:border-[#F7931E]"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isActive ? "bg-[#F7931E] text-white" : "bg-gray-50 text-[#F7931E]"
            }`}>
              <User size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-black text-xs uppercase tracking-tight truncate">
                  {otherParticipant?.name || "Support Ticket"}
                </h4>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  isActive ? "bg-white/10 text-[#F7931E]" : "bg-gray-100 text-gray-400"
                }`}>
                  {chat.type === "VENDOR_ADMIN" ? "Vendor" : "Customer"}
                </span>
              </div>
              <p className={`text-[11px] font-medium truncate ${isActive ? "text-white/70" : "text-gray-500"}`}>
                {chat.messages?.[0]?.content || "New Request Initialization..."}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}