





"use client";

import { Message } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";

// TACTICAL NOTE: We extend the type locally to include our new metadata fields
// if they aren't already generated in your local Prisma client.
type MessageWithProduct = Message & {
  productId?: string | null;
  productPrice?: string | null;
  productImage?: string | null;
};

export default function MessageBubble({ message }: { message: MessageWithProduct }) {
  const { data: session } = useSession();
  
  const isOwnMessage = session?.user?.id ? message.senderId === session.user.id : false;

  const timeStamp = message.createdAt 
    ? format(new Date(message.createdAt), "p") 
    : format(new Date(), "p");

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        
        <div 
          className={`px-5 py-3 rounded-2xl text-sm font-bold leading-relaxed shadow-sm overflow-hidden
            ${isOwnMessage 
              ? "bg-[#002B5B] text-white rounded-tr-none" 
              : "bg-white text-[#002B5B] border border-gray-100 rounded-tl-none"
            }`}
        >
          {/* TACTICAL PRODUCT CARD: Only renders if the message contains product metadata */}
          {message.productId && (
            <div className={`mb-3 flex items-center gap-3 p-2 rounded-xl border ${
              isOwnMessage 
                ? "bg-white/10 border-white/20" 
                : "bg-[#F8F8F8] border-gray-100"
            }`}>
              <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                <Image 
                  src={message.productImage || "/logo.png"} 
                  alt="Product" 
                  fill 
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isOwnMessage ? "text-white/60" : "text-gray-400"}`}>
                  Product Inquiry
                </span>
                <span className="text-[10px] font-black italic truncate leading-tight">
                  {message.productPrice}
                </span>
                <span className={`text-[7px] font-bold uppercase truncate ${isOwnMessage ? "text-[#F7931E]" : "text-[#002B5B]"}`}>
                  Asset ID: {message.productId.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* The actual text message */}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
            {timeStamp}
          </span>
          {isOwnMessage && (
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${message.isRead ? "text-[#F7931E]" : "text-gray-300"}`}>
              {message.isRead ? "• Delivered" : "• Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}