"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { requestRefund, setError } from "@/store/orderSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { RefreshCcw, CheckCircle2 } from "lucide-react";

interface RefundRequestButtonProps {
  orderId: string;
  refundStatus?: "none" | "requested" | "approved" | "rejected";
  orderStatus: string;
}

export default function RefundRequestButton({ 
  orderId, 
  refundStatus = "none", 
  orderStatus 
}: RefundRequestButtonProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();

  // Only allow refund requests for delivered items that haven't requested one yet
  const canRequestRefund = orderStatus === "delivered" && refundStatus === "none";

  const handleRefundRequest = async () => {
    // Basic browser confirmation for high-stakes actions
    if (!confirm("Are you sure you want to request a refund for this order?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit refund request");
      }

      // 1. Update Redux State locally for instant UI response
      dispatch(requestRefund({ id: orderId }));
      
      // 2. Notify the user using your custom notification handlers
      notifySuccess("Refund request submitted successfully.");
    } catch (err: any) {
      notifyError(err.message || "Something went wrong");
      dispatch(setError(err.message));
    } finally {
      setLoading(false);
    }
  };

  // State: Refund already requested
  if (refundStatus === "requested") {
    return (
      <div className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl">
        <RefreshCcw size={14} className="mr-2 animate-spin" />
        Refund Pending
      </div>
    );
  }

  // State: Refund completed
  if (refundStatus === "approved") {
    return (
      <div className="flex items-center text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl">
        <CheckCircle2 size={14} className="mr-2" />
        Refunded
      </div>
    );
  }

  // State: Not eligible for refund (e.g., order still in transit)
  if (!canRequestRefund) return null;

  return (
    <button
      onClick={handleRefundRequest}
      disabled={loading}
      className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50"
    >
      {loading ? "Processing..." : "Request Refund"}
    </button>
  );
}