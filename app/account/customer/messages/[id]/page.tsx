// "use client";

// import { useEffect, useState, useRef } from "react";
// // Using your established Prisma model structure
// import { Message } from "@prisma/client";
// import { pusherClient } from "@/app/lib/pusherClient";
// import { useNotification } from "@/app/_context/NotificationContext";
// import MessageBubble from "../../_components/MessageBubble";
// import MessageInput from "../../_components/MessageInput";
// import { Loader2 } from "lucide-react";

// // Updated Interface to accept the product context from the Drawer
// interface ChatContainerProps {
//   conversationId: string;
//   productContext?: {
//     id: string;
//     name: string;
//     price: string;
//     image: string;
//   };
// }



// export default function VendorChatPage({ conversationId, productContext }: ChatContainerProps) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const { notifyError } = useNotification();

//   // 1. Initial Fetch
//   useEffect(() => {
//     if (!conversationId) return;

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         // Using your current API structure
//         const res = await fetch(`/api/chat/conversations/${conversationId}`);
//         if (!res.ok) throw new Error();
//         const data = await res.json();
//         setMessages(data.messages || []);
//       } catch (error) {
//         notifyError("System Error: Unable to retrieve conversation.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMessages();
//   }, [conversationId, notifyError]);

//   // 2. Pusher Subscription
//   useEffect(() => {
//     if (!conversationId) return;

//     const channel = pusherClient.subscribe(conversationId);
    
//     channel.bind("new-message", (newMessage: Message) => {
//       setMessages((prev) => {
//         if (prev.find((m) => m.id === newMessage.id)) return prev;
//         return [...prev, newMessage];
//       });
//     });

//     return () => {
//       pusherClient.unsubscribe(conversationId);
//       channel.unbind("new-message");
//     };
//   }, [conversationId]);

//   // 3. Auto-scroll
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-full bg-[#FDFDFD]">
//       {/* Header Info */}
//       <div className="bg-[#002B5B] p-4 border-b border-gray-100 shrink-0">
//         <h2 className="text-white font-black italic uppercase text-[10px] tracking-widest">
//           Secure Comms: {conversationId?.slice(0, 8).toUpperCase()}...
//         </h2>
//         {/* Sub-header showing product context if active */}
//         {productContext && (
//           <p className="text-[#F7931E] text-[9px] font-bold uppercase mt-1">
//             RE: {productContext.name}
//           </p>
//         )}
//       </div>

//       {/* Message Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {/* PRODUCT CONTEXT BANNER: Only shows at the top of a new chat */}
//         {!loading && messages.length === 0 && productContext && (
//           <div className="mb-6 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
//             <img 
//               src={productContext.image} 
//               alt={productContext.name} 
//               className="w-12 h-12 rounded-lg object-cover border border-gray-100" 
//             />
//             <div className="flex-1">
//               <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Initial Inquiry</p>
//               <p className="text-xs font-bold text-[#002B5B] leading-tight">{productContext.name}</p>
//               <p className="text-[#F7931E] text-[10px] font-black">{productContext.price}</p>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="flex flex-col items-center justify-center h-full gap-2">
//             <Loader2 className="animate-spin text-[#F7931E]" size={20} />
//             <span className="text-[10px] font-black uppercase text-gray-400">Syncing Link...</span>
//           </div>
//         ) : (
//           messages.map((msg) => (
//             <MessageBubble key={msg.id} message={msg} />
//           ))
//         )}
//         <div ref={scrollRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-gray-100 bg-white">
//         <MessageInput 
//           conversationId={conversationId} 
//           // If messages.length is 0, we pass the product context to the input 
//           // so it can be sent with the first message.
//           initialProductContext={messages.length === 0 ? productContext : undefined}
//         />
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
// Using your established Prisma model structure
import { Message } from "@prisma/client";
import { pusherClient } from "@/app/lib/pusherClient";
import { useNotification } from "@/app/_context/NotificationContext";
import MessageBubble from "../../_components/MessageBubble";
import MessageInput from "../../_components/MessageInput";
import { Loader2 } from "lucide-react";

// Updated Interface to include vendorProfileId to match SerializedProduct context requirements
interface ChatContainerProps {
  conversationId: string;
  productContext?: {
    id: string;
    name: string;
    price: string;
    image: string;
    vendorProfileId: string; // FIXED: Added missing required property
  };
}

export default function VendorChatPage({ conversationId, productContext }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { notifyError } = useNotification();

  // 1. Initial Fetch
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Using your current API structure
        const res = await fetch(`/api/chat/conversations/${conversationId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (error) {
        notifyError("System Error: Unable to retrieve conversation.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, notifyError]);

  // 2. Pusher Subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = pusherClient.subscribe(conversationId);
    
    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      pusherClient.unsubscribe(conversationId);
      channel.unbind("new-message");
    };
  }, [conversationId]);

  // 3. Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD]">
      {/* Header Info */}
      <div className="bg-[#002B5B] p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-white font-black italic uppercase text-[10px] tracking-widest">
          Secure Comms: {conversationId?.slice(0, 8).toUpperCase()}...
        </h2>
        {/* Sub-header showing product context if active */}
        {productContext && (
          <p className="text-[#F7931E] text-[9px] font-bold uppercase mt-1">
            RE: {productContext.name}
          </p>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* PRODUCT CONTEXT BANNER: Only shows at the top of a new chat */}
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
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Initial Inquiry</p>
              <p className="text-xs font-bold text-[#002B5B] leading-tight">{productContext.name}</p>
              <p className="text-[#F7931E] text-[10px] font-black">{productContext.price}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin text-[#F7931E]" size={20} />
            <span className="text-[10px] font-black uppercase text-gray-400">Syncing Link...</span>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <MessageInput 
          conversationId={conversationId} 
          // If messages.length is 0, we pass the product context to the input 
          // so it can be sent with the first message.
          initialProductContext={messages.length === 0 ? productContext : undefined}
        />
      </div>
    </div>
  );
}