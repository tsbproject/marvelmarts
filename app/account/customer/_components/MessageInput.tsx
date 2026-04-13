



// "use client";

// import { useState } from "react";
// import { Send, Loader2 } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext"; 

// interface MessageInputProps {
//   conversationId: string;
//   // NEW: Added to receive context from the parent VendorChatPage
//   initialProductContext?: {
//     id: string;
//     name: string;
//     price: string;
//     image: string;
//     vendorProfileId: string;
//   };
// }

// export default function MessageInput({ conversationId, initialProductContext }: MessageInputProps) {
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { notifyError } = useNotification(); 

//   const handleSendMessage = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   // ALIGNMENT: Allow sending if we have a conversationId OR we are starting a new one with a product
//   if (!message.trim() || isLoading) return;
//   if (!conversationId && !initialProductContext?.vendorProfileId) return;

//   const currentMessage = message.trim();
//   setIsLoading(true);

//   try {
//     const response = await fetch("/api/chat/send", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         conversationId: conversationId || null, // Can be null for first message
//         recipientId: initialProductContext?.vendorProfileId, // Crucial for new chats
//         content: currentMessage,
//         productId: initialProductContext?.id,
//         productPrice: initialProductContext?.price,
//         productImage: initialProductContext?.image,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || "Transmission failed");
//     }

//     setMessage(""); 
//     // If this was a new chat, the server will return the new conversationId
//     // You might want to update your local state with it here if needed.
//   } catch (error: any) {
//     console.error("Chat Send Error:", error);
//     notifyError(error.message || "Signal Lost: Message failed to send."); 
//   } finally {
//     setIsLoading(false);
//   }
// };
//   return (
//     <div className="p-4 bg-white border-t border-gray-100">
//       <form onSubmit={handleSendMessage} className="relative flex items-center group">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your tactical inquiry..."
//           className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400"
//           disabled={isLoading}
//         />
//         <button
//           type="submit"
//           disabled={!message.trim() || isLoading}
//           className="absolute right-2 p-3 bg-[#F7931E] text-white rounded-xl hover:bg-[#002B5B] transition-all disabled:opacity-50 disabled:bg-gray-300 shadow-md active:scale-95"
//         >
//           {isLoading ? (
//             <Loader2 size={20} className="animate-spin" />
//           ) : (
//             <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
//           )}
//         </button>
//       </form>
//       <p className="text-[9px] text-center mt-2 font-black uppercase tracking-widest text-gray-300">
//         MarvelMarts Secure Live Chat Active
//       </p>
//     </div>
//   );
// }






"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

interface MessageInputProps {
  conversationId: string;
  initialProductContext?: {
    id: string;
    name: string;
    price: string;
    image: string;
    vendorProfileId: string;
  };
  chatStatus?: "OPEN" | "CLOSED";
  visitorName?: string;
  visitorEmail?: string;
  guestAccessToken?: string;
  onConversationCreated?: (conversationId: string, guestAccessToken?: string | null) => void;
}

export default function MessageInput({
  conversationId,
  initialProductContext,
  chatStatus = "OPEN",
  visitorName,
  visitorEmail,
  guestAccessToken,
  onConversationCreated,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { notifyError } = useNotification();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;
    if (chatStatus === "CLOSED") {
      notifyError("This chat has already been ended.");
      return;
    }

    if (!conversationId && !initialProductContext?.vendorProfileId) return;

    const currentMessage = message.trim();
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId || null,
          recipientId: initialProductContext?.vendorProfileId,
          content: currentMessage,
          productId: initialProductContext?.id,
          productPrice: initialProductContext?.price,
          productImage: initialProductContext?.image,
          visitorName: visitorName || null,
          visitorEmail: visitorEmail || null,
          guestAccessToken: guestAccessToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transmission failed");
      }

      setMessage("");

      if (data?.conversationId && onConversationCreated) {
        onConversationCreated(data.conversationId, data.guestAccessToken);
      }
    } catch (error: any) {
      console.error("Chat Send Error:", error);
      notifyError(error.message || "Signal Lost: Message failed to send.");
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || chatStatus === "CLOSED";

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <form onSubmit={handleSendMessage} className="relative flex items-center group">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={chatStatus === "CLOSED" ? "This chat has ended" : "Type your tactical inquiry..."}
          className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#F7931E] focus:bg-white transition-all text-[#002B5B] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 p-3 bg-[#F7931E] text-white rounded-xl hover:bg-[#002B5B] transition-all disabled:opacity-50 disabled:bg-gray-300 shadow-md active:scale-95"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          )}
        </button>
      </form>
      <p className="text-[9px] text-center mt-2 font-black uppercase tracking-widest text-gray-300">
        MarvelMarts Secure Live Chat Active
      </p>
    </div>
  );
}