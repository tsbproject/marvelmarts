"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext"; 
import ChatDrawer from "@/app/_components/ChatDrawer";

export default function ChatWithVendor({ 
  vendorProfileId, 
  productName,
  productId,    // Added
  productPrice,  // Added
  productImage   // Added
}: { 
  vendorProfileId: string; 
  productName: string; 
  productId: string;
  productPrice: string;
  productImage: string;
}) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotification(); 

  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleStartChat = async () => {
    if (activeConversationId) {
      setIsOpen(true);
      return;
    }

    setIsInitializing(true);
    try {
      const res = await fetch("/api/conversations/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: vendorProfileId,
          type: "CUSTOMER_VENDOR",
          subject: `Inquiry: ${productName}`
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          notifyError("Identity Verification Required: Please sign in to chat.");
          return router.push("/auth/sign-in");
        }
        throw new Error("Failed to initialize communication channel.");
      }

      const data = await res.json();
      
      if (data.conversationId) {
        notifySuccess("Signal Established: Channel Secure.");
        setActiveConversationId(data.conversationId);
        setIsOpen(true);
      }
    } catch (error) {
      console.error(error);
      notifyError("System Error: Could not establish secure link.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleStartChat}
        disabled={isInitializing}
        className="w-full flex items-center justify-center gap-2 py-4 bg-[#002B5B] text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-[#F7931E] transition-all disabled:opacity-70 group"
      >
        {isInitializing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
        )}
        {isInitializing ? "Encrypting Link..." : "Chat with Seller"}
      </button>

      {activeConversationId && (
        <ChatDrawer 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          conversationId={activeConversationId} 
          // PASSING PRODUCT CONTEXT TO DRAWER
          productContext={{
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
          }}
        />
      )}
    </>
  );
}