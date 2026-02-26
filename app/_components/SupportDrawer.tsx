// "use client";

// import { useState, useEffect, useRef } from "react";
// import { 
//   MessageCircle, X, Send, 
//   ShieldCheckIcon, 
//   Store, 
//   User, 
//   Loader2,
//   Clock
// } from "lucide-react";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { format } from "date-fns";

// interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   senderName: string;
//   createdAt: string;
// }

// export default function SupportDrawer() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<"FORM" | "CHAT">("FORM");
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [waitTime, setWaitTime] = useState<number>(5);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     email: "",
//     name: "",
//     isVendor: false,
//   });

//   // 1. Fetch Wait Time Logic
//   useEffect(() => {
//     const fetchQueue = async () => {
//       try {
//         const res = await fetch("/api/admins/support/queue");
//         if (res.ok) {
//           const data = await res.json();
//           setWaitTime(data.openTickets * 2 || 5);
//         }
//       } catch (err) {
//         setWaitTime(5);
//       }
//     };
//     if (isOpen && step === "FORM") fetchQueue();
//   }, [isOpen, step]);

//   // 2. Real-time Subscription
//   useEffect(() => {
//     if (!conversationId) return;

//     const channel = pusherClient.subscribe(conversationId);
    
//     channel.bind("new-message", (msg: Message) => {
//       setMessages((prev) => {
//         if (prev.find(m => m.id === msg.id)) return prev;
//         return [...prev, msg];
//       });
//     });

//     return () => {
//       pusherClient.unsubscribe(conversationId);
//     };
//   }, [conversationId]);

//   // 3. Auto-scroll Logic
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, step]);

//   const handleInitiate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch("/api/admins/conversations/initiate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const contentType = res.headers.get("content-type");
      
//       if (res.ok && contentType?.includes("application/json")) {
//         const data = await res.json();
//         const newConvId = data.conversationId;
        
//         // Update state but use local variable for immediate next fetch
//         setConversationId(newConvId);
        
//         // Fetch existing messages using the fresh ID directly (Prevents 'undefined' error)
//         const msgRes = await fetch(`/api/admins/conversations/${newConvId}/messages`);
        
//         if (msgRes.ok) {
//           const msgData = await msgRes.json();
//           setMessages(msgData.messages || []);
//           setStep("CHAT");
//         } else {
//           const errorMsg = await msgRes.text();
//           console.error("Failed to load history:", errorMsg);
//           setStep("CHAT"); 
//         }
//       } else {
//         const errorText = await res.text();
//         alert(errorText || "Verification failed. Ensure you are using a registered email.");
//       }
//     } catch (err) {
//       console.error("Network error during initiation:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!chatInput.trim() || !conversationId) return;

//   const content = chatInput;
//   setChatInput("");

//   try {
//     const res = await fetch(`/api/admins/conversations/${conversationId}/messages`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content }),
//     });
    
//     if (!res.ok) {
//       const errorText = await res.text();
//       // This will now tell you if it's "Unauthorized", "Forbidden", etc.
//       console.error("Message failed to send:", errorText);
//       alert(`Could not send: ${errorText}`); 
//     }
//   } catch (err) {
//     console.error("Message delivery failed:", err);
//   }
// };
//   const handleCloseChat = () => {
//     if (window.confirm("End this support session? Your message history will be preserved.")) {
//       setStep("FORM");
//       setConversationId(null);
//       setMessages([]);
//       setChatInput("");
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed bottom-6 right-6 w-14 h-14 bg-accent-navy text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[999]"
//       >
//         {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
//       </button>

//       <div className={`fixed bottom-24 right-6 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform z-[999] ${
//         isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
//       }`}>
        
//         <div className="bg-accent-navy p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-accent-navy">
//                 <ShieldCheckIcon size={20} />
//               </div>
//               <div>
//                 <h4 className="font-black uppercase text-xs tracking-widest">Support Hub</h4>
//                 <p className="text-[10px] opacity-70 font-bold uppercase flex items-center gap-1">
//                   <Clock size={10} /> Est. Wait: {waitTime} mins
//                 </p>
//               </div>
//             </div>
            
//             {step === "CHAT" && (
//               <button onClick={handleCloseChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
//                 <X size={18} className="text-white/50" />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="p-6 h-[450px] flex flex-col">
//           {step === "FORM" ? (
//             <form onSubmit={handleInitiate} className="space-y-4">
//               <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mb-4">
//                 Verify your identity to start a secure chat with an Admin.
//               </p>
              
//               <div className="space-y-1">
//                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Registered Email</label>
//                 <input 
//                   required
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent-navy/5 outline-none"
//                   placeholder="tayo@example.com"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">
//                   {formData.isVendor ? "Store Name" : "Full Name"}
//                 </label>
//                 <input 
//                   required
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent-navy/5 outline-none"
//                   placeholder={formData.isVendor ? "Marvelous Store" : "Tayo Bolarinwa"}
//                 />
//               </div>

//               <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mt-4">
//                 <button 
//                   type="button"
//                   onClick={() => setFormData({...formData, isVendor: false})}
//                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${!formData.isVendor ? 'bg-white shadow-sm text-accent-navy' : 'text-gray-400'}`}
//                 >
//                   <User size={14} /> Customer
//                 </button>
//                 <button 
//                   type="button"
//                   onClick={() => setFormData({...formData, isVendor: true})}
//                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${formData.isVendor ? 'bg-white shadow-sm text-accent-navy' : 'text-gray-400'}`}
//                 >
//                   <Store size={14} /> Vendor
//                 </button>
//               </div>

//               <button 
//                 disabled={loading}
//                 className="w-full bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest mt-6 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? <Loader2 size={16} className="animate-spin" /> : "Secure Initialize"}
//               </button>
//             </form>
//           ) : (
//             <div className="flex flex-col h-full">
//               <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
//                 {messages.map((msg, idx) => {
//                   const isMe = msg.senderId !== "SYSTEM" && !msg.senderName.toLowerCase().includes("support");
//                   return (
//                     <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//                       <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
//                         isMe ? "bg-accent-navy text-white rounded-tr-none" : "bg-gray-100 text-gray-700 rounded-tl-none"
//                       }`}>
//                         {msg.content}
//                         <p className="text-[7px] mt-1 opacity-50 text-right uppercase">
//                           {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "Just now"}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <div ref={scrollRef} />
//               </div>

//               <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t border-gray-50">
//                 <input 
//                   autoFocus
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   placeholder="Type a message..."
//                   className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-accent-navy outline-none"
//                 />
//                 <button type="submit" className="bg-accent-navy text-white p-3 rounded-xl hover:scale-105 transition-transform">
//                   <Send size={16} />
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }





"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, X, Send, 
  ShieldCheckIcon, 
  Store, 
  User, 
  Loader2,
  Clock
} from "lucide-react";
import { pusherClient } from "@/app/lib/pusherClient";
import { format } from "date-fns";

// ADDED: Props interface to allow external control
interface SupportDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export default function SupportDrawer({ isOpen: externalIsOpen, onClose }: SupportDrawerProps) {
  // INTERNAL STATE: Used if no props are provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // DERIVED STATE: Use external prop if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"FORM" | "CHAT">("FORM");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [waitTime, setWaitTime] = useState<number>(5);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    isVendor: false,
  });

  // Toggle Function: Respects the onClose prop if it exists
  const handleToggle = () => {
    if (onClose && isOpen) {
      onClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // 1. Fetch Wait Time Logic
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/admins/support/queue");
        if (res.ok) {
          const data = await res.json();
          setWaitTime(data.openTickets * 2 || 5);
        }
      } catch (err) {
        setWaitTime(5);
      }
    };
    if (isOpen && step === "FORM") fetchQueue();
  }, [isOpen, step]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = pusherClient.subscribe(conversationId);
    
    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      pusherClient.unsubscribe(conversationId);
    };
  }, [conversationId]);

  // 3. Auto-scroll Logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, step]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admins/conversations/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      
      if (res.ok && contentType?.includes("application/json")) {
        const data = await res.json();
        const newConvId = data.conversationId;
        setConversationId(newConvId);
        
        const msgRes = await fetch(`/api/admins/conversations/${newConvId}/messages`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
          setStep("CHAT");
        } else {
          setStep("CHAT"); 
        }
      } else {
        const errorText = await res.text();
        alert(errorText || "Verification failed. Ensure you are using a registered email.");
      }
    } catch (err) {
      console.error("Network error during initiation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationId) return;

    const content = chatInput;
    setChatInput("");

    try {
      await fetch(`/api/admins/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      console.error("Message delivery failed:", err);
    }
  };

  const handleCloseChat = () => {
    if (window.confirm("End this support session? Your message history will be preserved.")) {
      setStep("FORM");
      setConversationId(null);
      setMessages([]);
      setChatInput("");
    }
  };

  return (
    <>
      {/* TRIGGER BUBBLE: Only show if NOT controlled by landing page (optional preference) */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-navy text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[999]"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <div className={`fixed bottom-24 right-6 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform z-[999] ${
        isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
      }`}>
        
        <div className="bg-accent-navy p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-accent-navy">
                <ShieldCheckIcon size={20} />
              </div>
              <div>
                <h4 className="font-black uppercase text-xs tracking-widest">Support Hub</h4>
                <p className="text-[10px] opacity-70 font-bold uppercase flex items-center gap-1">
                  <Clock size={10} /> Est. Wait: {waitTime} mins
                </p>
              </div>
            </div>
            
            {/* Close Button: Calls handleToggle to respect external props */}
            <button onClick={handleToggle} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} className="text-white/50" />
            </button>
          </div>
        </div>

        <div className="p-6 h-[450px] flex flex-col">
          {step === "FORM" ? (
            <form onSubmit={handleInitiate} className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mb-4">
                Verify your identity to start a secure chat with an Admin.
              </p>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Registered Email</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent-navy/5 outline-none text-black"
                  placeholder="tayo@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">
                  {formData.isVendor ? "Store Name" : "Full Name"}
                </label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent-navy/5 outline-none text-black"
                  placeholder={formData.isVendor ? "Marvelous Store" : "Tayo Bolarinwa"}
                />
              </div>

              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mt-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isVendor: false})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${!formData.isVendor ? 'bg-white shadow-sm text-accent-navy' : 'text-gray-400'}`}
                >
                  <User size={14} /> Customer
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isVendor: true})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${formData.isVendor ? 'bg-white shadow-sm text-accent-navy' : 'text-gray-400'}`}
                >
                  <Store size={14} /> Vendor
                </button>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest mt-6 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Secure Initialize"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId !== "SYSTEM" && !msg.senderName.toLowerCase().includes("support");
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                        isMe ? "bg-accent-navy text-white rounded-tr-none" : "bg-gray-100 text-gray-700 rounded-tl-none"
                      }`}>
                        {msg.content}
                        <p className="text-[7px] mt-1 opacity-50 text-right uppercase">
                          {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "Just now"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t border-gray-50">
                <input 
                  autoFocus
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-accent-navy outline-none text-black"
                />
                <button type="submit" className="bg-accent-navy text-white p-3 rounded-xl hover:scale-105 transition-transform">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}