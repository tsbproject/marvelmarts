"use client";

import { X } from "lucide-react";
import VendorChatPage from "../account/customer/messages/[id]/page"; 

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
 
  // NEW: Product Context
  
  productContext?: {
    id: string;
    name: string;
    price: string;
    image: string;
    vendorProfileId: string;
    
  };
}

export default function ChatDrawer({ isOpen, onClose, conversationId, productContext }: ChatDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sliding Drawer */}
      <div className="fixed right-10 top-50 h-200 w-full max-w-lg bg-white shadow-2xl z-[999] animate-in slide-in-from-right duration-300 flex flex-col border-l border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#002B5B] text-white shrink-0">
          <div className="flex flex-col">
            <h3 className="font-black uppercase italic text-xs tracking-[0.2em]">Secure Live Chat</h3>
            <p className="text-[9px] text-[#F7931E] font-bold uppercase tracking-widest opacity-80">
              {productContext ? `RE: ${productContext.name}` : 'Link Active'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Chat Content Area */}
        <div className="flex-1 overflow-hidden bg-[#F8F8F8]">
          {/* We pass the context into the Page component */}
          <VendorChatPage 
            conversationId={conversationId} 
            productContext={productContext} 
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">
            MarvelMarts Encryption Protocol v2.6
          </p>
        </div>
      </div>
    </>
  );
}