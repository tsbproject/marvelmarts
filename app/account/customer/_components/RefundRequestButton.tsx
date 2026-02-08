"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { requestRefund, setError } from "@/store/orderSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";

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
  
  // Using your specific NotificationContext setup
  const { notifySuccess, notifyError } = useNotification();

  const canRequestRefund = orderStatus === "delivered" && refundStatus === "none";

  const handleRefundRequest = async () => {
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

      dispatch(requestRefund({ id: orderId }));
      
      // Correct notification calls
      notifySuccess("Refund request submitted successfully.");
    } catch (err: any) {
      notifyError(err.message || "Something went wrong");
      dispatch(setError(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (refundStatus === "requested") {
    return (
      <div className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
        <RefreshCcw size={14} className="mr-2 animate-spin" />
        Refund Pending
      </div>
    );
  }

  if (refundStatus === "approved") {
    return (
      <div className="flex items-center text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl border border-green-100">
        <CheckCircle2 size={14} className="mr-2" />
        Refunded
      </div>
    );
  }

  if (refundStatus === "rejected") {
    return (
      <div className="flex items-center text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl border border-red-100">
        <AlertCircle size={14} className="mr-2" />
        Refund Rejected
      </div>
    );
  }

  if (!canRequestRefund) return null;

  return (
    <button
      onClick={handleRefundRequest}
      disabled={loading}
      className="w-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100 px-4 py-3 rounded-xl hover:bg-blue-600"
    >
      {loading ? (
        <>
          <RefreshCcw size={14} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        "Request Refund"
      )}
    </button>
  );
}