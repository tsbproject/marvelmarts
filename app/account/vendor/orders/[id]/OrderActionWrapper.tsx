"use client";

import { useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext"; // Correct context path
import { PackageCheck, XCircle, Loader2 } from "lucide-react";

interface OrderActionProps {
  orderId: string;
  currentStatus: string;
  trackingNumber?: string | null;
}

export default function OrderActionWrapper({ 
  orderId, 
  currentStatus, 
  trackingNumber 
}: OrderActionProps) {
  const { notifyError, notifySuccess } = useNotification(); // Correct hook usage
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [trackNum, setTrackNum] = useState(trackingNumber || "");
  const [status, setStatus] = useState(currentStatus.toUpperCase());

  const handleUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    // Validation for tracking number on approval
    if (newStatus === "APPROVED" && !trackNum.trim()) {
      notifyError("Please enter a tracking number to approve the order.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: newStatus === "APPROVED" ? trackNum : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setStatus(newStatus);
      notifySuccess(`Order ${newStatus.toLowerCase()} successfully!`);
      
      if (newStatus === "REJECTED") {
        setShowRejectConfirm(false);
      }

    } catch (error: any) {
      notifyError(error.message || "Something went wrong during the update.");
    } finally {
      setLoading(false);
    }
  };

  // Finalized UI state after processing
  if (status !== "PENDING") {
    return (
      <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-accent-navy uppercase">Order Logged</h3>
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          status === "APPROVED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {status === "APPROVED" ? <PackageCheck size={20} /> : <XCircle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            Order Status: {status}
          </span>
        </div>
        {status === "APPROVED" && trackNum && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">Tracking Info</p>
            <p className="text-xs font-bold text-accent-navy select-all">{trackNum}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm space-y-6">
      <h3 className="text-sm font-black text-accent-navy uppercase">Merchant Actions</h3>

      {/* TRACKING INPUT FIELD */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-neutral-gray uppercase ml-1">
          Tracking / Courier ID
        </label>
        <div className="relative">
          <input 
            type="text"
            placeholder="e.g. GIGL-7782-X"
            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-bold text-accent-navy focus:border-brand-primary outline-none transition-all"
            value={trackNum}
            onChange={(e) => setTrackNum(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* MERGED APPROVE LOGIC */}
        <button
          onClick={() => handleUpdate("APPROVED")}
          disabled={loading}
          className="w-full bg-accent-navy text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-accent-navy transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <PackageCheck size={14} />}
          Approve & Notify Customer
        </button>

        {/* MERGED REJECT LOGIC */}
        {!showRejectConfirm ? (
          <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={loading}
            className="w-full py-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
            Reject Order
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3 animate-in fade-in zoom-in-95">
            <p className="text-[9px] font-black text-red-700 uppercase text-center">Confirm Rejection?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdate("REJECTED")}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-[9px] font-black uppercase"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 bg-white border border-red-200 text-red-700 py-2 rounded-xl text-[9px] font-black uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}