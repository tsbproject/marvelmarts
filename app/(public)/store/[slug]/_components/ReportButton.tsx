"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ReportButton({ vendorId, storeName }: { vendorId: string, storeName: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReport = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!confirm(`Are you sure you want to report ${storeName} to MarvelMarts Admin?`)) return;

    setLoading(true);
    try {
      // 1. We find a system Admin ID (You might need a specific endpoint or hardcoded system ID)
      // For now, we hit the general chat send with the type CUSTOMER_ADMIN
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: "ADMIN_SYSTEM_ID", // This should be your central admin user ID
          type: "CUSTOMER_ADMIN",
          content: `SYSTEM LOG: Customer initiated a report against Vendor: ${storeName} (${vendorId}).`,
        }),
      });

      if (res.ok) {
        alert("Report submitted. An admin will contact you via the message center shortly.");
        router.push("/dashboard/messages"); // Send them to their inbox
      }
    } catch (error) {
      console.error("Report failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-red-100 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
      Report Store
    </button>
  );
}