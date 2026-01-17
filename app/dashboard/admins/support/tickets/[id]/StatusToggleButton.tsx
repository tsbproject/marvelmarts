"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StatusToggleButton({ ticketId, currentStatus }: { ticketId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    
    try {
      await fetch(`/api/support/tickets/status`, {
        method: "PUT",
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
        currentStatus === 'OPEN' 
          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/20' 
          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-900/20'
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : currentStatus === 'OPEN' ? (
        <><CheckCircle size={18} /> Mark as Resolved</>
      ) : (
        <><Clock size={18} /> Re-open Ticket</>
      )}
    </button>
  );
}