// app/dashboard/admins/orders/[id]/RefundButton.tsx
"use client";

import { useState } from "react";
import { processRefund } from "@/app/services/adminOrderActions";
import { useNotification } from "@/app/_context/NotificationContext";

export default function RefundButton({ orderId }: { orderId: string }) {
  const [isPending, setIsPending] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleRefund = async () => {
    const confirmAction = confirm(
      "CONFIRM REVERSAL: Are you sure you want to refund this order? This action is permanent."
    );
    
    if (!confirmAction) return;

    setIsPending(true);
    
    const result = await processRefund(orderId, "Administrative Reversal via Command Center");
    
    if (result.success) {
      // Calls your specific notifySuccess method for the 'Marvel Success' toast
      notifySuccess(result.message);
    } else {
      // Calls notifyError for the red styled toast
      notifyError(result.message);
    }
    
    setIsPending(false);
  };

  return (
    <button
      onClick={handleRefund}
      disabled={isPending}
      className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm
        ${isPending 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
        }`}
    >
      {isPending ? "Processing Reversal..." : "Initiate Refund"}
    </button>
  );
}