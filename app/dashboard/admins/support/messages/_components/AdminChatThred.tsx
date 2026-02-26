// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { Send, ShieldCheck, Clock, Loader2, MessageSquare } from "lucide-react";
// import { format } from "date-fns";
// import DisputeModal from "./DisputeModal"; 
// import { useNotification } from "@/app/_context/NotificationContext";

// interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   senderName: string;
//   createdAt: string;
// }

// const CANNED_RESPONSES = [
//   { label: "Request Proof", text: "Please provide clear photos or video evidence to support your claim so we can proceed with the investigation." },
//   { label: "Final Warning", text: "Your account is currently under review for a policy violation. Further infractions will lead to permanent suspension." },
//   { label: "Refund Approved", text: "We have reviewed the dispute and approved a refund. The funds should reflect in the customer's balance shortly." },
//   { label: "Dispute Closed", text: "This dispute has been marked as resolved. If you have further questions, please open a new support ticket." },
// ];

// export default function AdminChatThread({ conversationId }: { conversationId: string }) {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [input, setInput] = useState("");
//   const [showCanned, setShowCanned] = useState(false);
//   const [targetUser, setTargetUser] = useState<{id: string, name: string} | null>(null);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const { notifyError } = useNotification();

//   useEffect(() => {
//     const fetchChat = async () => {
//       if (!conversationId) return;
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/admins/conversations/${conversationId}/messages`);
//         if (!res.ok) throw new Error("Failed to fetch");
        
//         const data = await res.json();
        
//         // FIX: Handle both cases where data might be the array itself or an object containing messages
//         const msgs = Array.isArray(data) ? data : data.messages || [];
//         setMessages(msgs);
        
//         // Find the participant (Vendor/Customer) - adjust logic based on your API response structure
//         const participants = data.participants || [];
//         const target = participants.find((p: any) => 
//           p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
//         );
        
//         if (target) {
//           setTargetUser({ id: target.id, name: target.name });
//         }
//       } catch (error) {
//         notifyError("Failed to decrypt secure thread.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChat();

//     const channel = pusherClient.subscribe(conversationId);
    
//     channel.bind("new-message", (msg: Message) => {
//       setMessages((prev) => {
//         if (prev.find((m) => m.id === msg.id)) return prev;
//         return [...prev, msg];
//       });
//     });

//     return () => {
//       pusherClient.unsubscribe(conversationId);
//       channel.unbind_all();
//     };
//   }, [conversationId]);

//   // Scroll to bottom whenever messages list changes
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || !conversationId) return;

//     const tempInput = input;
//     setInput(""); 
//     setShowCanned(false);

//     try {
//       const res = await fetch(`/api/admins/conversations/${conversationId}/messages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: tempInput }),
//       });

//       if (!res.ok) {
//         setInput(tempInput);
//         notifyError("Transmission interrupted. Retry sent.");
//       }
//     } catch (error) {
//       setInput(tempInput);
//       notifyError("Connection failed.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white h-[600px]">
//         <Loader2 className="animate-spin text-[#F7931E]" size={32} />
//         <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Decrypting Secure Thread...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full min-h-[600px] bg-white relative rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
//       {/* THREAD HEADER */}
//       <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-white z-10">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white shadow-inner">
//             <ShieldCheck size={20} />
//           </div>
//           <div>
//             <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight">Support Intervention</h3>
//             <p className="text-[9px] text-emerald-500 font-bold uppercase flex items-center gap-1">
//               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Secure Channel
//             </p>
//           </div>
//         </div>

//         {targetUser && (
//           <DisputeModal vendorProfileId={targetUser.id} vendorName={targetUser.name} />
//         )}
//       </div>

//       {/* MESSAGE VIEWPORT */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FBFBFB] no-scrollbar">
//         {messages.length === 0 && (
//           <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
//             <MessageSquare size={48} />
//             <p className="text-[10px] font-black uppercase mt-2">No transmission data</p>
//           </div>
//         )}
        
//         {messages.map((msg, idx) => {
//           // Robust Admin check: Check name, role, or if senderId matches current admin session
//           const isAdmin = 
//             msg.senderName?.includes("Support") || 
//             msg.senderName === "SYSTEM" || 
//             msg.senderId === session?.user?.id;
          
//           const isSystemAction = msg.senderName === "SYSTEM_ENFORCEMENT";

//           return (
//             <div key={msg.id || idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
//               <div className={`group flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[80%]`}>
//                 <div className="flex items-center gap-2 mb-1.5 px-1">
//                   <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{msg.senderName}</span>
//                   <span className="text-[9px] font-bold text-neutral-300">
//                     {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "--:--"}
//                   </span>
//                 </div>

//                 <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
//                   isSystemAction 
//                     ? "bg-red-50 border border-red-100 text-red-700 italic font-medium w-full text-center"
//                     : isAdmin 
//                     ? "bg-[#002B5B] text-white rounded-tr-none shadow-indigo-200/50" 
//                     : "bg-white border border-neutral-100 text-[#002B5B] rounded-tl-none"
//                 }`}>
//                   {msg.content}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={scrollRef} className="h-2" />
//       </div>

//       {/* INPUT DRAWER */}
//       <div className="p-6 bg-white border-t border-neutral-50 relative">
//         {showCanned && (
//           <div className="absolute bottom-full left-6 mb-4 w-80 bg-white border border-neutral-100 shadow-2xl rounded-3xl p-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
//             <p className="text-[8px] font-black text-neutral-400 uppercase p-2 tracking-widest border-b border-neutral-50 mb-2">Command Center Presets</p>
//             <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
//               {CANNED_RESPONSES.map((resp) => (
//                 <button
//                   key={resp.label}
//                   type="button"
//                   onClick={() => {
//                     setInput(resp.text);
//                     setShowCanned(false);
//                   }}
//                   className="w-full text-left p-3 hover:bg-neutral-50 rounded-2xl transition-colors group"
//                 >
//                   <p className="text-[10px] font-black text-[#002B5B] uppercase tracking-tight group-hover:text-[#F7931E]">{resp.label}</p>
//                   <p className="text-[10px] text-neutral-500 truncate font-medium">{resp.text}</p>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
//           <button 
//             type="button"
//             onClick={() => setShowCanned(!showCanned)}
//             className={`p-4 rounded-2xl transition-all ${showCanned ? 'bg-[#F7931E] text-white shadow-inner' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
//           >
//             <MessageSquare size={20} />
//           </button>

//           <div className="flex-1 relative">
//             <input 
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Type official MarvelMarts response..."
//               className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-[#002B5B]/10 transition-all outline-none"
//             />
//             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300">
//               <Clock size={18} />
//             </div>
//           </div>
//           <button 
//             type="submit"
//             disabled={!input.trim()}
//             className="bg-[#002B5B] text-white p-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
//           >
//             <Send size={20} />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/lib/pusherClient";
import { Send, ShieldCheck, Clock, Loader2, MessageSquare } from "lucide-react";
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

const CANNED_RESPONSES = [
  { label: "Request Proof", text: "Please provide clear photos or video evidence to support your claim so we can proceed with the investigation." },
  { label: "Final Warning", text: "Your account is currently under review for a policy violation. Further infractions will lead to permanent suspension." },
  { label: "Refund Approved", text: "We have reviewed the dispute and approved a refund. The funds should reflect in the customer's balance shortly." },
  { label: "Dispute Closed", text: "This dispute has been marked as resolved. If you have further questions, please open a new support ticket." },
];

export default function AdminChatThread({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showCanned, setShowCanned] = useState(false);
  const [targetUser, setTargetUser] = useState<{id: string, name: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { notifyError } = useNotification();

  useEffect(() => {
    const fetchChat = async () => {
      if (!conversationId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admins/conversations/${conversationId}/messages`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        // Handle both cases where data might be the array itself or an object
        const msgs = Array.isArray(data) ? data : data.messages || [];
        setMessages(msgs);
        
        // Find the non-admin participant (Vendor or Customer)
        const participants = data.participants || [];
        const target = participants.find((p: any) => 
          p.role !== "ADMIN" && p.role !== "SUPER_ADMIN"
        );
        
        if (target) {
          setTargetUser({ id: target.id, name: target.name });
        }
      } catch (error) {
        notifyError("Failed to decrypt secure thread.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    const channel = pusherClient.subscribe(conversationId);
    
    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      pusherClient.unsubscribe(conversationId);
      channel.unbind_all();
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const tempInput = input;
    setInput(""); 
    setShowCanned(false);

    try {
      const res = await fetch(`/api/admins/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempInput }),
      });

      if (!res.ok) {
        setInput(tempInput);
        notifyError("Transmission interrupted. Retry sent.");
      }
    } catch (error) {
      setInput(tempInput);
      notifyError("Connection failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white h-[600px]">
        <Loader2 className="animate-spin text-[#F7931E]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Decrypting Secure Thread...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white relative rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
      {/* THREAD HEADER */}
      <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#002B5B] uppercase tracking-tight">Support Intervention</h3>
            <p className="text-[9px] text-emerald-500 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Secure Channel
            </p>
          </div>
        </div>

        {targetUser && (
          <DisputeModal vendorProfileId={targetUser.id} vendorName={targetUser.name} />
        )}
      </div>

      {/* MESSAGE VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FBFBFB] no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
            <MessageSquare size={48} />
            <p className="text-[10px] font-black uppercase mt-2">No transmission data</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isAdmin = 
            msg.senderName?.includes("Support") || 
            msg.senderName === "SYSTEM" || 
            msg.senderId === session?.user?.id;
          
          const isSystemAction = msg.senderName === "SYSTEM_ENFORCEMENT";

          return (
            <div key={msg.id || idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`group flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{msg.senderName}</span>
                  <span className="text-[9px] font-bold text-neutral-300">
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "--:--"}
                  </span>
                </div>

                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                  isSystemAction 
                    ? "bg-red-50 border border-red-100 text-red-700 italic font-medium w-full text-center"
                    : isAdmin 
                    ? "bg-[#002B5B] text-white rounded-tr-none shadow-indigo-200/50" 
                    : "bg-white border border-neutral-100 text-[#002B5B] rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-2" />
      </div>

      {/* INPUT DRAWER */}
      <div className="p-6 bg-white border-t border-neutral-50 relative">
        {showCanned && (
          <div className="absolute bottom-full left-6 mb-4 w-80 bg-white border border-neutral-100 shadow-2xl rounded-3xl p-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[8px] font-black text-neutral-400 uppercase p-2 tracking-widest border-b border-neutral-50 mb-2">Command Center Presets</p>
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
                  <p className="text-[10px] font-black text-[#002B5B] uppercase tracking-tight group-hover:text-[#F7931E]">{resp.label}</p>
                  <p className="text-[10px] text-neutral-500 truncate font-medium">{resp.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowCanned(!showCanned)}
            className={`p-4 rounded-2xl transition-all ${showCanned ? 'bg-[#F7931E] text-white shadow-inner' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
          >
            <MessageSquare size={20} />
          </button>

          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type official MarvelMarts response..."
              className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-[#002B5B]/10 transition-all outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300">
              <Clock size={18} />
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-[#002B5B] text-white p-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}