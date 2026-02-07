// app/account/customer/_components/RefundRequestButton.tsx
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
}) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();

  // Only allow refund requests for delivered items that haven't requested one yet
  const canRequestRefund = orderStatus === "delivered" && refundStatus === "none";

  const handleRefundRequest = async () => {
    if (!confirm("Are you sure you want to request a refund for this order?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit refund request");
      }

      // Update Redux State
      dispatch(requestRefund({ id: orderId }));
      notifySuccess("Refund request submitted successfully.");
    } catch (err: any) {
      notifyError(err.message);
      dispatch(setError(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (refundStatus === "requested") {
    return (
      <div className="flex items-center text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1 rounded-lg">
        <RefreshCcw size={14} className="mr-2 animate-spin-slow" />
        Refund Pending
      </div>
    );
  }

  if (refundStatus === "approved") {
    return (
      <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-lg">
        <CheckCircle2 size={14} className="mr-2" />
        Refunded
      </div>
    );
  }

  if (!canRequestRefund) return null;

  return (
    <button
      onClick={handleRefundRequest}
      disabled={loading}
      className="text-xs font-black uppercase tracking-widest text-brand-primary hover:text-accent-navy transition-colors disabled:opacity-50"
    >
      {loading ? "Processing..." : "Request Refund"}
    </button>
  );
}