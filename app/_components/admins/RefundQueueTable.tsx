"use client";

import { useState, useMemo } from "react";
import { 
  CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, 
  AlertCircle, Receipt, User, Package, RefreshCcw 
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

interface RefundQueueTableProps {
  requests: any[];
}

export default function RefundQueueTable({ requests: initialRequests }: RefundQueueTableProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotification();
  
  const itemsPerPage = 6;

  // --- API Action Handler ---
  const handleRefundAction = async (orderId: string, action: "approved" | "rejected") => {
    const confirmMsg = action === "approved" 
      ? "Confirm financial reversal? This action is permanent." 
      : "Reject this request? The customer will be notified of the decline.";
    
    if (!confirm(confirmMsg)) return;

    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/admins/refunds`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          action, 
          adminNote: action === "approved" ? "Verified & Approved" : "Policy Violation: Item condition/window" 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Protocol failed");

      // Remove from queue locally since it's no longer 'pending' or 'requested'
      setRequests((prev) => prev.filter((r) => r.id !== orderId));
      notifySuccess(`Refund ${action} successfully.`);
    } catch (err: any) {
      notifyError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // --- Filter Logic ---
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => 
      r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Internal Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Filter by Order # or Customer..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-100 outline-none"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order & Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Decision Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length > 0 ? currentItems.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy/5 rounded-lg text-navy">
                        <Receipt size={18} />
                      </div>
                      <div>
                        <p className="font-black italic text-navy uppercase">{order.orderNumber}</p>
                        <p className="text-[9px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                        {order.firstName?.[0] || <User size={14}/>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{order.firstName} {order.lastName}</p>
                        <p className="text-[10px] text-gray-400">{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-navy">₦{order.total.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      {order.items?.length || 0} Items In Cart
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleRefundAction(order.id, "approved")}
                        disabled={processingId === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processingId === order.id ? <RefreshCcw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleRefundAction(order.id, "rejected")}
                        disabled={processingId === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <XCircle size={12} />
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <AlertCircle size={48} />
                      <p className="font-black uppercase tracking-[0.2em] text-xs">Queue Clear: All Requests Processed</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        {totalPages > 1 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Showing {currentItems.length} of {filteredRequests.length} Requests
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-orange-50 hover:border-orange-200 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30 hover:bg-orange-50 hover:border-orange-200 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}