

// // "use client";

// // import { useEffect, useState, useRef } from "react";
// // // Using your established Prisma model structure
// // import { Message } from "@prisma/client";
// // import { pusherClient } from "@/app/lib/pusherClient";
// // import { useNotification } from "@/app/_context/NotificationContext";
// // import MessageBubble from "../../_components/MessageBubble";
// // import MessageInput from "../../_components/MessageInput";
// // import { Loader2 } from "lucide-react";

// // // Updated Interface to include vendorProfileId to match SerializedProduct context requirements
// // interface ChatContainerProps {
// //   conversationId: string;
// //   productContext?: {
// //     id: string;
// //     name: string;
// //     price: string;
// //     image: string;
// //     vendorProfileId: string; // FIXED: Added missing required property
// //   };
// // }

// // export default function VendorChatPage({ conversationId, productContext }: ChatContainerProps) {
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const scrollRef = useRef<HTMLDivElement>(null);
// //   const { notifyError } = useNotification();

// //   // 1. Initial Fetch
// //   useEffect(() => {
// //     if (!conversationId) return;

// //     const fetchMessages = async () => {
// //       try {
// //         setLoading(true);
// //         // Using your current API structure
// //         const res = await fetch(`/api/chat/conversations/${conversationId}`);
// //         if (!res.ok) throw new Error();
// //         const data = await res.json();
// //         setMessages(data.messages || []);
// //       } catch (error) {
// //         notifyError("System Error: Unable to retrieve conversation.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchMessages();
// //   }, [conversationId, notifyError]);

// //   // 2. Pusher Subscription
// //   useEffect(() => {
// //     if (!conversationId) return;

// //     const channel = pusherClient.subscribe(conversationId);
    
// //     channel.bind("new-message", (newMessage: Message) => {
// //       setMessages((prev) => {
// //         if (prev.find((m) => m.id === newMessage.id)) return prev;
// //         return [...prev, newMessage];
// //       });
// //     });

// //     return () => {
// //       pusherClient.unsubscribe(conversationId);
// //       channel.unbind("new-message");
// //     };
// //   }, [conversationId]);

// //   // 3. Auto-scroll
// //   useEffect(() => {
// //     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   return (
// //     <div className="flex flex-col h-full bg-[#FDFDFD]">
// //       {/* Header Info */}
// //       <div className="bg-[#002B5B] p-4 border-b border-gray-100 shrink-0">
// //         <h2 className="text-white font-black italic uppercase text-[10px] tracking-widest">
// //           Secure Comms: {conversationId?.slice(0, 8).toUpperCase()}...
// //         </h2>
// //         {/* Sub-header showing product context if active */}
// //         {productContext && (
// //           <p className="text-[#F7931E] text-[9px] font-bold uppercase mt-1">
// //             RE: {productContext.name}
// //           </p>
// //         )}
// //       </div>

// //       {/* Message Area */}
// //       <div className="flex-1 overflow-y-auto p-4 space-y-3">
// //         {/* PRODUCT CONTEXT BANNER: Only shows at the top of a new chat */}
// //         {!loading && messages.length === 0 && productContext && (
// //           <div className="mb-6 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
// //             {productContext.image ? (
// //               <img 
// //                 src={productContext.image} 
// //                 alt={productContext.name} 
// //                 className="w-12 h-12 rounded-lg object-cover border border-gray-100" 
// //               />
// //             ) : (
// //               <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
// //                 <Loader2 className="animate-spin text-gray-400" size={12} />
// //               </div>
// //             )}
// //             <div className="flex-1">
// //               <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Initial Inquiry</p>
// //               <p className="text-xs font-bold text-[#002B5B] leading-tight">{productContext.name}</p>
// //               <p className="text-[#F7931E] text-[10px] font-black">{productContext.price}</p>
// //             </div>
// //           </div>
// //         )}

// //         {loading ? (
// //           <div className="flex flex-col items-center justify-center h-full gap-2">
// //             <Loader2 className="animate-spin text-[#F7931E]" size={20} />
// //             <span className="text-[10px] font-black uppercase text-gray-400">Syncing Link...</span>
// //           </div>
// //         ) : (
// //           messages.map((msg) => (
// //             <MessageBubble key={msg.id} message={msg} />
// //           ))
// //         )}
// //         <div ref={scrollRef} />
// //       </div>

// //       {/* Input Area */}
// //       <div className="p-4 border-t border-gray-100 bg-white">
// //         <MessageInput 
// //           conversationId={conversationId} 
// //           // If messages.length is 0, we pass the product context to the input 
// //           // so it can be sent with the first message.
// //           initialProductContext={messages.length === 0 ? productContext : undefined}
// //         />
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import { useEffect, useState, useRef } from "react";
// import { Message } from "@prisma/client";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { useNotification } from "@/app/_context/NotificationContext";
// import MessageBubble from "../../_components/MessageBubble";
// import MessageInput from "../../_components/MessageInput";
// import { Loader2 } from "lucide-react";

// interface ChatContainerProps {
//   conversationId: string;
//   productContext?: {
//     id: string;
//     name: string;
//     price: string;
//     image: string;
//     vendorProfileId: string;
//   };
// }

// interface ConversationMeta {
//   id: string;
//   subject?: string | null;
//   status: "OPEN" | "CLOSED";
//   isGuest: boolean;
//   visitorName?: string | null;
//   visitorEmail?: string | null;
//   endedAt?: string | null;
//   endedById?: string | null;
//   endedByRole?: string | null;
// }

// export default function VendorChatPage({ conversationId, productContext }: ChatContainerProps) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [conversationMeta, setConversationMeta] = useState<ConversationMeta | null>(null);
//   const [activeConversationId, setActiveConversationId] = useState(conversationId);
//   const [guestAccessToken, setGuestAccessToken] = useState<string>("");
//   const [visitorName, setVisitorName] = useState("");
//   const [visitorEmail, setVisitorEmail] = useState("");
//   const [visitorReady, setVisitorReady] = useState(false);

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const { notifyError } = useNotification();

//   useEffect(() => {
//     const savedToken = typeof window !== "undefined"
//       ? localStorage.getItem(`guest-chat-token-${conversationId}`)
//       : null;

//     if (savedToken) {
//       setGuestAccessToken(savedToken);
//       setVisitorReady(true);
//     }
//   }, [conversationId]);

//   useEffect(() => {
//     if (!activeConversationId) {
//       setLoading(false);
//       return;
//     }

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);

//         const url = guestAccessToken
//           ? `/api/chat/conversations/${activeConversationId}?guestAccessToken=${encodeURIComponent(guestAccessToken)}`
//           : `/api/chat/conversations/${activeConversationId}`;

//         const res = await fetch(url);
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.error || "Unable to retrieve conversation.");

//         setMessages(data.messages || []);
//         setConversationMeta(data.conversation || null);

//         if (data.conversation?.visitorName) {
//           setVisitorName(data.conversation.visitorName);
//           setVisitorEmail(data.conversation.visitorEmail || "");
//           setVisitorReady(true);
//         }
//       } catch (error: any) {
//         notifyError(error.message || "System Error: Unable to retrieve conversation.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [activeConversationId, guestAccessToken, notifyError]);

//   useEffect(() => {
//     if (!activeConversationId) return;

//     const channel = pusherClient.subscribe(activeConversationId);

//     channel.bind("new-message", (newMessage: Message) => {
//       setMessages((prev) => {
//         if (prev.find((m) => m.id === newMessage.id)) return prev;
//         return [...prev, newMessage];
//       });
//     });

//     channel.bind("conversation-ended", (payload: { status: "CLOSED"; endedAt: string; endedByRole?: string }) => {
//       setConversationMeta((prev) =>
//         prev
//           ? {
//               ...prev,
//               status: "CLOSED",
//               endedAt: payload.endedAt,
//               endedByRole: payload.endedByRole || prev.endedByRole,
//             }
//           : prev
//       );
//     });

//     return () => {
//       pusherClient.unsubscribe(activeConversationId);
//       channel.unbind_all();
//     };
//   }, [activeConversationId]);

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleGuestContinue = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!visitorName.trim() || !visitorEmail.trim()) {
//       notifyError("Please enter your name and email before continuing.");
//       return;
//     }

//     setVisitorReady(true);
//   };

//   const handleConversationCreated = (newConversationId: string, token?: string | null) => {
//     setActiveConversationId(newConversationId);

//     if (token) {
//       setGuestAccessToken(token);
//       if (typeof window !== "undefined") {
//         localStorage.setItem(`guest-chat-token-${conversationId}`, token);
//         localStorage.setItem(`guest-chat-token-${newConversationId}`, token);
//       }
//     }
//   };

//   const chatClosed = conversationMeta?.status === "CLOSED";

//   return (
//     <div className="flex flex-col h-full bg-[#FDFDFD]">
//       <div className="bg-[#002B5B] p-4 border-b border-gray-100 shrink-0">
//         <h2 className="text-white font-black italic uppercase text-[10px] tracking-widest">
//           Secure Comms: {activeConversationId?.slice(0, 8).toUpperCase() || "NEW LINK"}...
//         </h2>
//         {productContext && (
//           <p className="text-[#F7931E] text-[9px] font-bold uppercase mt-1">
//             RE: {productContext.name}
//           </p>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {!loading && messages.length === 0 && productContext && (
//           <div className="mb-6 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
//             {productContext.image ? (
//               <img
//                 src={productContext.image}
//                 alt={productContext.name}
//                 className="w-12 h-12 rounded-lg object-cover border border-gray-100"
//               />
//             ) : (
//               <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
//                 <Loader2 className="animate-spin text-gray-400" size={12} />
//               </div>
//             )}
//             <div className="flex-1">
//               <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Initial Inquiry</p>
//               <p className="text-xs font-bold text-[#002B5B] leading-tight">{productContext.name}</p>
//               <p className="text-[#F7931E] text-[10px] font-black">{productContext.price}</p>
//             </div>
//           </div>
//         )}

//         {chatClosed && (
//           <div className="mb-4 p-3 rounded-2xl border border-red-100 bg-red-50">
//             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
//               This chat has been ended by {conversationMeta?.endedByRole?.toLowerCase() || "the agent"}.
//             </p>
//           </div>
//         )}

//         {loading ? (
//           <div className="flex flex-col items-center justify-center h-full gap-2">
//             <Loader2 className="animate-spin text-[#F7931E]" size={20} />
//             <span className="text-[10px] font-black uppercase text-gray-400">Syncing Link...</span>
//           </div>
//         ) : (
//           messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
//         )}
//         <div ref={scrollRef} />
//       </div>

//       <div className="p-4 border-t border-gray-100 bg-white">
//         {!conversationMeta && !visitorReady ? (
//           <form onSubmit={handleGuestContinue} className="space-y-3">
//             <input
//               type="text"
//               value={visitorName}
//               onChange={(e) => setVisitorName(e.target.value)}
//               placeholder="Enter your full name"
//               className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400"
//             />
//             <input
//               type="email"
//               value={visitorEmail}
//               onChange={(e) => setVisitorEmail(e.target.value)}
//               placeholder="Enter your email address"
//               className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400"
//             />
//             <button
//               type="submit"
//               className="w-full bg-[#002B5B] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#001f45] transition-all"
//             >
//               Continue to Secure Chat
//             </button>
//           </form>
//         ) : (
//           <MessageInput
//             conversationId={activeConversationId}
//             initialProductContext={messages.length === 0 ? productContext : undefined}
//             chatStatus={conversationMeta?.status || "OPEN"}
//             visitorName={visitorName}
//             visitorEmail={visitorEmail}
//             guestAccessToken={guestAccessToken}
//             onConversationCreated={handleConversationCreated}
//           />
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "@prisma/client";
import { pusherClient } from "@/app/lib/pusherClient";
import { useNotification } from "@/app/_context/NotificationContext";
import MessageBubble from "../../_components/MessageBubble";
import MessageInput from "../../_components/MessageInput";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  conversationId: string;
  productContext?: {
    id: string;
    name: string;
    price: string;
    image: string;
    vendorProfileId: string;
  };
}

interface ConversationMeta {
  id: string;
  subject?: string | null;
  status: "OPEN" | "CLOSED";
  isGuest: boolean;
  visitorName?: string | null;
  visitorEmail?: string | null;
  endedAt?: string | null;
  endedById?: string | null;
  endedByRole?: string | null;
}

export default function VendorChatPage({
  conversationId,
  productContext,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationMeta, setConversationMeta] = useState<ConversationMeta | null>(null);
  const [activeConversationId, setActiveConversationId] = useState(conversationId || "");
  const [guestAccessToken, setGuestAccessToken] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorReady, setVisitorReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { notifyError } = useNotification();

  useEffect(() => {
    setActiveConversationId(conversationId || "");
  }, [conversationId]);

  useEffect(() => {
    if (typeof window !== "undefined" && !conversationId) {
      localStorage.removeItem("guest-chat-token-");
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const savedToken =
      typeof window !== "undefined"
        ? localStorage.getItem(`guest-chat-token-${conversationId}`)
        : null;

    if (savedToken) {
      setGuestAccessToken(savedToken);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const url = guestAccessToken
          ? `/api/chat/conversations/${activeConversationId}?guestAccessToken=${encodeURIComponent(
              guestAccessToken
            )}`
          : `/api/chat/conversations/${activeConversationId}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to retrieve conversation.");
        }

        setMessages(data.messages || []);
        setConversationMeta(data.conversation || null);

        if (data.conversation?.visitorName) {
          setVisitorName(data.conversation.visitorName);
          setVisitorEmail(data.conversation.visitorEmail || "");
          setVisitorReady(true);
        }
      } catch (error: any) {
        notifyError(error.message || "System Error: Unable to retrieve conversation.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeConversationId, guestAccessToken, notifyError]);

  useEffect(() => {
    if (!activeConversationId) return;

    const channel = pusherClient.subscribe(activeConversationId);

    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    channel.bind(
      "conversation-ended",
      (payload: { status: "CLOSED"; endedAt: string; endedByRole?: string }) => {
        setConversationMeta((prev) =>
          prev
            ? {
                ...prev,
                status: "CLOSED",
                endedAt: payload.endedAt,
                endedByRole: payload.endedByRole || prev.endedByRole,
              }
            : prev
        );
      }
    );

    return () => {
      pusherClient.unsubscribe(activeConversationId);
      channel.unbind_all();
    };
  }, [activeConversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGuestContinue = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = visitorName.trim();
    const cleanEmail = visitorEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      notifyError("Please enter your name and email before continuing.");
      return;
    }

    setVisitorName(cleanName);
    setVisitorEmail(cleanEmail);
    setVisitorReady(true);
  };

  const handleConversationCreated = (
    newConversationId: string,
    token?: string | null
  ) => {
    setActiveConversationId(newConversationId);

    if (token) {
      setGuestAccessToken(token);

      if (typeof window !== "undefined") {
        if (conversationId) {
          localStorage.setItem(`guest-chat-token-${conversationId}`, token);
        }
        localStorage.setItem(`guest-chat-token-${newConversationId}`, token);
      }
    }
  };

  const chatClosed = conversationMeta?.status === "CLOSED";

  const shouldShowGuestForm = !conversationMeta && !visitorReady;
  const canShowMessageInput = Boolean(conversationMeta) || visitorReady;

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD]">
      {/* Header Info */}
      <div className="bg-[#002B5B] p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-white font-black italic uppercase text-[10px] tracking-widest">
          Secure Comms: {activeConversationId?.slice(0, 8).toUpperCase() || "NEW LINK"}...
        </h2>

        {productContext && (
          <p className="text-[#F7931E] text-[9px] font-bold uppercase mt-1">
            RE: {productContext.name}
          </p>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!loading && messages.length === 0 && productContext && (
          <div className="mb-6 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            {productContext.image ? (
              <img
                src={productContext.image}
                alt={productContext.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-100"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={12} />
              </div>
            )}
            <div className="flex-1">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                Initial Inquiry
              </p>
              <p className="text-xs font-bold text-[#002B5B] leading-tight">
                {productContext.name}
              </p>
              <p className="text-[#F7931E] text-[10px] font-black">
                {productContext.price}
              </p>
            </div>
          </div>
        )}

        {chatClosed && (
          <div className="mb-4 p-3 rounded-2xl border border-red-100 bg-red-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              This chat has been ended by{" "}
              {conversationMeta?.endedByRole?.toLowerCase() || "the agent"}.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin text-[#F7931E]" size={20} />
            <span className="text-[10px] font-black uppercase text-gray-400">
              Syncing Link...
            </span>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {shouldShowGuestForm ? (
          <form onSubmit={handleGuestContinue} className="space-y-3">
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400"
            />
            <input
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="w-full bg-[#002B5B] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#001f45] transition-all"
            >
              Continue to Secure Chat
            </button>
          </form>
        ) : canShowMessageInput ? (
          <MessageInput
            conversationId={activeConversationId}
            initialProductContext={messages.length === 0 ? productContext : undefined}
            chatStatus={conversationMeta?.status || "OPEN"}
            visitorName={visitorName}
            visitorEmail={visitorEmail}
            guestAccessToken={guestAccessToken}
            onConversationCreated={handleConversationCreated}
          />
        ) : null}
      </div>
    </div>
  );
}