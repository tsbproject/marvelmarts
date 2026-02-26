// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";

// interface Message {
//   id: string;
//   senderId: string;
//   senderName: string;
//   content: string;
//   createdAt: string;
//   isRead: boolean;
//   productId?: string;
//   productPrice?: string;
//   productImage?: string;
// }

// export default function VendorChatThread() {
//   const { id } = useParams();
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // 1. SCROLL TO BOTTOM
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 2. DATA FETCHING & REAL-TIME SUBSCRIPTION
//   useEffect(() => {
//     if (!id || !session?.user?.id) return;

//     const fetchThread = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`/api/vendors/conversations/${id}`);
        
//         if (!res.ok) throw new Error("Failed to sync frequency");
        
//         const data = await res.json();
        
//         // Ensure we handle both a raw array or a conversation object with a messages key
//         const threadMessages = data.messages || (Array.isArray(data) ? data : []);
//         setMessages(threadMessages);
//       } catch (error) {
//         console.error("Layer Sync Error:", error);
//       } finally {
//         // CRITICAL: This stops the "Syncing Frequency" loader
//         setLoading(false);
//       }
//     };

//     fetchThread();

//     // Subscribe to the conversation ID directly to match customer-side broadcast
//     const channel = pusherClient.subscribe(id as string);

//     channel.bind("new-message", (newMessage: Message) => {
//       setMessages((prev) => {
//         if (prev.find((m) => m.id === newMessage.id)) return prev;
//         return [...prev, newMessage];
//       });
      
//       // Auto-mark as read if the message is from the customer
//       if (newMessage.senderId !== session.user.id) {
//         fetch(`/api/vendors/conversations/${id}/read`, { method: "POST" });
//       }
//     });

//     channel.bind("messages-read", ({ readerId }: { readerId: string }) => {
//       if (readerId !== session.user.id) {
//         setMessages((prev) => 
//           prev.map(m => m.senderId === session.user.id ? { ...m, isRead: true } : m)
//         );
//       }
//     });

//     return () => {
//       pusherClient.unsubscribe(id as string);
//       channel.unbind_all();
//     };
//   }, [id, session?.user?.id]);

//   // 3. SEND MESSAGE LOGIC
//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const content = input;
//     setInput("");

//     try {
//       const response = await fetch(`/api/vendors/conversations/${id}/messages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content }),
//       });

//       if (!response.ok) throw new Error("Transmission failed");
//     } catch (error) {
//       console.error("Failed to send:", error);
//     }
//   };

//   if (loading) return (
//     <div className="p-8 flex items-center gap-3 min-h-[50vh] justify-center">
//       <div className="w-2 h-2 bg-[#F7931E] rounded-full animate-bounce" />
//       <div className="text-[10px] font-black uppercase tracking-widest text-[#002B5B]">Syncing Frequency...</div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col h-[85vh] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
//       {/* HEADER */}
//       <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
//         <div className="flex items-center gap-4">
//           <Link href="/account/vendor/messages" className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
//             <ArrowLeft size={20} />
//           </Link>
//           <div>
//             <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight">Transmission Thread</h3>
//             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ID: {id?.slice(-8)}</p>
//           </div>
//         </div>
//       </div>

//       {/* MESSAGES AREA */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FBFBFB]/50">
//         {messages.length === 0 ? (
//           <div className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
//             End of encrypted thread
//           </div>
//         ) : (
//           messages.map((msg) => {
//             const isMe = msg.senderId === session?.user?.id;
//             return (
//               <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//                 <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm relative ${
//                   isMe 
//                     ? "bg-[#002B5B] text-white rounded-tr-none" 
//                     : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
//                 }`}>
//                   {/* PRODUCT CONTEXT: Only shows if the message has product metadata */}
//                   {msg.productId && (
//                     <div className={`mb-3 flex items-center gap-3 p-2 rounded-xl border ${
//                       isMe ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"
//                     }`}>
//                       <div className="relative w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0">
//                         <Image 
//                           src={msg.productImage || "/logo.png"} 
//                           alt="Inquiry Item" 
//                           fill 
//                           className="object-contain p-1" 
//                         />
//                       </div>
//                       <div className="flex flex-col overflow-hidden">
//                         <span className="text-[7px] font-black uppercase text-[#F7931E]">Inquiry Asset</span>
//                         <span className={`text-[10px] font-bold truncate ${isMe ? "text-white" : "text-[#002B5B]"}`}>
//                           {msg.productPrice}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   <p className="leading-relaxed font-medium pb-2 whitespace-pre-wrap">{msg.content}</p>
                  
//                   <div className={`flex items-center gap-1 opacity-60 ${isMe ? "justify-end" : "justify-start"}`}>
//                     <span className="text-[8px] font-black uppercase">
//                       {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
                    
//                     {isMe && (
//                       <span className="ml-1">
//                         {msg.isRead ? (
//                           <CheckCheck size={12} className="text-[#F7931E]" />
//                         ) : (
//                           <Check size={12} className="text-gray-300" />
//                         )}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//         <div ref={scrollRef} />
//       </div>

//       {/* INPUT AREA */}
//       <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your tactical response..."
//           className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#F7931E]/20 outline-none transition-all"
//         />
//         <button 
//           type="submit" 
//           disabled={!input.trim()}
//           className="bg-[#F7931E] disabled:opacity-50 text-white p-3 rounded-2xl hover:bg-[#E08214] transition-all shadow-lg shadow-[#F7931E]/20"
//         >
//           <Send size={18} />
//         </button>
//       </form>
//     </div>
//   );
// }



"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/lib/pusherClient";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// TACTICAL UTILITY: Notification Sound
const playNotifySound = () => {
  const audio = new Audio("/sounds/notification.mp3");
  audio.play().catch(() => console.log("Audio playback blocked by browser."));
};

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  productId?: string;
  productPrice?: string;
  productImage?: string;
}

export default function VendorChatThread() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. SCROLL TO BOTTOM
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. DATA FETCHING & REAL-TIME SUBSCRIPTION
  useEffect(() => {
    if (!id || !session?.user?.id) return;

    const fetchThread = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vendors/conversations/${id}`);
        if (!res.ok) throw new Error("Failed to sync frequency");
        const data = await res.json();
        const threadMessages = data.messages || (Array.isArray(data) ? data : []);
        setMessages(threadMessages);
      } catch (error) {
        console.error("Layer Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    const channel = pusherClient.subscribe(id as string);

    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      // AUDIO ALERT: Play if message is from the customer
      if (newMessage.senderId !== session.user.id) {
        playNotifySound();
        fetch(`/api/vendors/conversations/${id}/read`, { method: "POST" });
      }
    });

    channel.bind("messages-read", ({ readerId }: { readerId: string }) => {
      if (readerId !== session.user.id) {
        setMessages((prev) => 
          prev.map(m => m.senderId === session.user.id ? { ...m, isRead: true } : m)
        );
      }
    });

    return () => {
      pusherClient.unsubscribe(id as string);
      channel.unbind_all();
    };
  }, [id, session?.user?.id]);

  // 3. SEND MESSAGE LOGIC
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput("");

    try {
      const response = await fetch(`/api/vendors/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Transmission failed");
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 min-h-[50vh] justify-center">
      <div className="w-2 h-2 bg-[#F7931E] rounded-full animate-bounce" />
      <div className="text-[10px] font-black uppercase tracking-widest text-[#002B5B]">Syncing Frequency...</div>
    </div>
  );

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/account/vendor/messages" className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight">Transmission Thread</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ID: {id?.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FBFBFB]/50">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
            End of encrypted thread
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm relative ${
                  isMe 
                    ? "bg-[#002B5B] text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                }`}>
                  {/* ALIGNMENT FIX: Showing product details if they exist on the message */}
                  {msg.productId && (
                    <div className={`mb-3 flex items-center gap-3 p-2 rounded-xl border ${
                      isMe ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"
                    }`}>
                      <div className="relative w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0">
                        <Image 
                          src={msg.productImage || "/logo.png"} 
                          alt="Inquiry Item" 
                          fill 
                          className="object-contain p-1" 
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[7px] font-black uppercase text-[#F7931E]">Inquiry Asset</span>
                        <span className={`text-[10px] font-bold truncate ${isMe ? "text-white" : "text-[#002B5B]"}`}>
                          {msg.productPrice}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="leading-relaxed font-medium pb-2 whitespace-pre-wrap">{msg.content}</p>
                  
                  <div className={`flex items-center gap-1 opacity-60 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[8px] font-black uppercase">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {isMe && (
                      <span className="ml-1">
                        {msg.isRead ? (
                          <CheckCheck size={12} className="text-[#F7931E]" />
                        ) : (
                          <Check size={12} className="text-gray-300" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your tactical response..."
          className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#F7931E]/20 outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-[#F7931E] disabled:opacity-50 text-white p-3 rounded-2xl hover:bg-[#E08214] transition-all shadow-lg shadow-[#F7931E]/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}