"use client";

import { useState } from "react";
import { rejectRefund } from "@/app/services/adminOrderActions"; 
import { useNotification } from "@/app/_context/NotificationContext";
import { XCircle, RefreshCcw } from "lucide-react";

export default function RejectButton({ orderId }: { orderId: string }) {
  const [isPending, setIsPending] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleReject = async () => {
    const reason = prompt(
      "DECLINE PROTOCOL: Please provide a reason for rejecting this refund (this will be sent to the customer):",
      "Policy Violation: Item condition or return window exceeded."
    );
    
    // Exit if user cancels or provides empty string
    if (reason === null || reason.trim() === "") return;

    const confirmAction = confirm(
      "Are you sure you want to REJECT this refund request? The customer will be notified."
    );
    
    if (!confirmAction) return;

    setIsPending(true);
    
    try {
      // Calling your service logic for rejection
      const result = await rejectRefund(orderId, reason);
      
      if (result.success) {
        notifySuccess(result.message || "Refund request successfully declined.");
      } else {
        notifyError(result.message || "Failed to decline request.");
      }
    } catch (err: any) {
      notifyError("An unexpected error occurred during rejection.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleReject}
      disabled={isPending}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm border
        ${isPending 
          ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed" 
          : "bg-white text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white hover:border-orange-600 active:scale-95"
        }`}
    >
      {isPending ? (
        <>
          <RefreshCcw size={14} className="animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <XCircle size={14} />
          Reject Request
        </>
      )}
    </button>
  );
}