"use client";

import { useState, useMemo } from "react";
import { 
  Eye, Search, ChevronLeft, ChevronRight, Download, CheckCircle, RefreshCcw, XCircle 
} from "lucide-react";
import Link from "next/link";
import StatusToggle from "@/app/_components/admins/StatusToggle"; 
import { useNotification } from "@/app/_context/NotificationContext";

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const itemsPerPage = 8;

  // NotificationContext hooks
  const { notifySuccess, notifyError } = useNotification();

  // --- CSV EXPORT FUNCTION ---
  const exportToCSV = () => {
    const headers = ["Order Number,Date,Customer,Email,Total,Status,Payment,Refund,Items\n"];
    const rows = orders.map(o => {
      const itemTitles = o.items?.map((i: any) => i.title).join(" | ") || "";
      return `${o.orderNumber},${new Date(o.createdAt).toLocaleDateString()},${o.firstName} ${o.lastName},${o.email},${o.total},${o.status},${o.paymentStatus ? 'Paid' : 'Unpaid'},${o.refundStatus || 'none'},"${itemTitles}"\n`;
    });

    const csvData = new Blob([headers + rows.join("")], { type: "text/csv" });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvUrl;
    link.download = `MarvelMarts_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  /**
   * handleApproveRefund: 
   * Triggers the real-time sync via unified endpoint and updates local UI state.
   */
     const handleApproveRefund = async (
        orderId: string
      ) => {
        if (
          !confirm(
            "Approve this refund request for processing?"
          )
        ) {
          return;
        }

        setIsSyncing(orderId);

        try {
          const res = await fetch(
            `/api/admins/refunds`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                orderId,
                action: "approved",
                adminNote:
                  "Authorized via Command Center Table",
              }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data.error ||
                "Failed to approve refund"
            );
          }

          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    refundStatus: "approved",
                    cancelReason:
                      "Authorized via Command Center Table",
                  }
                : order
            )
          );

          notifySuccess(
            "Refund request approved and queued for processing."
          );
        } catch (err: any) {
          notifyError(
            err.message ||
              "System failure during refund approval."
          );
        } finally {
          setIsSyncing(null);
        }
      };



      const handleProcessRefund = async (
          orderId: string
        ) => {
          if (
            !confirm(
              "PROCESS REFUND: This will submit the approved refund to Paystack and post the financial reversal. Continue?"
            )
          ) {
            return;
          }

          setIsSyncing(orderId);

          try {
            const res = await fetch(
              "/api/admins/refunds/process",
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId,
                }),
              }
            );

            const data = await res.json();

            if (!res.ok) {
              throw new Error(
                data.error ||
                  data.message ||
                  "Failed to process refund."
              );
            }

            setOrders((prev) =>
              prev.map((order) =>
                order.id === orderId
                  ? {
                      ...order,
                      status: "refunded",
                      refundStatus: "completed",
                      refundReference:
                        data.refund?.reference ??
                        order.refundReference,
                    }
                  : order
              )
            );

            notifySuccess(
              data.message ||
                "Refund processed successfully."
            );
          } catch (err: any) {
            notifyError(
              err.message ||
                "System failure during refund processing."
            );
          } finally {
            setIsSyncing(null);
          }
        };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return orders;
    return orders.filter((o) => {
      const fullName = `${o.firstName} ${o.lastName}`.toLowerCase();
      const hasProduct = o.items?.some((item: any) => item.title.toLowerCase().includes(term));
      return (
        fullName.includes(term) || 
        o.orderNumber.toLowerCase().includes(term) || 
        o.email.toLowerCase().includes(term) || 
        hasProduct
      );
    });
  }, [searchTerm, orders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-5 rounded-[2rem] border border-[#F8F8F8] shadow-sm gap-4">
        <div className="relative w-full max-w-md ">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Name, Order #, or Product..."
            className="w-full pl-12 pr-4 py-4 bg-[#F8F8F8] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FFE8CC] outline-none"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Vault Records</span>
            <span className="text-xs font-black text-[#002B5B]">{filteredOrders.length} Found</span>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-4 bg-[#002B5B] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#F7931E] transition-all shadow-lg active:scale-95"
          >
            <Download size={16} className="text-[#F7931E]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#F8F8F8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F8F8]">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Reference</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Customer</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Total</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Fulfillment Control</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">Refund Action</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#4B4B4B] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F8F8]">
              {currentItems.map((order) => (
                <tr key={order.id} className="hover:bg-[#FFE8CC]/5 transition-all group">
                  <td className="p-6">
                    <p className="font-black italic text-[#002B5B]">{order.orderNumber}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase mt-1">
                      {new Date(order.createdAt).toDateString()}
                    </p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-[#1E1E1E]">{order.firstName} {order.lastName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{order.email}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-[#002B5B]">₦{Number(order.total).toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                       <span className={`text-[9px] font-black uppercase ${order.paymentStatus ? 'text-green-600' : 'text-red-500'}`}>
                         {order.paymentStatus ? 'Paid' : 'Unpaid'}
                       </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-3">
                      <StatusToggle
                        order={order}
                        onUpdate={(newStatus) =>
                          handleStatusUpdate(order.id, newStatus)
                        }
                      />

                      {order.vendorOrders?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                            Vendor Readiness:
                          </span>

                          {(() => {
                            const approvedCount = order.vendorOrders.filter(
                              (vendorOrder: any) =>
                                vendorOrder.status === "APPROVED"
                            ).length;

                            const rejectedCount = order.vendorOrders.filter(
                              (vendorOrder: any) =>
                                vendorOrder.status === "REJECTED"
                            ).length;

                            const pendingCount = order.vendorOrders.filter(
                              (vendorOrder: any) =>
                                vendorOrder.status === "PENDING"
                            ).length;

                            return (
                              <>
                                {approvedCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-green-600 border border-green-100">
                                    ✓ {approvedCount} Approved
                                  </span>
                                )}

                                {rejectedCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-red-500 border border-red-100">
                                    ⚠ {rejectedCount} Rejected
                                  </span>
                                )}

                                {pendingCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-amber-600 border border-amber-100">
                                    {pendingCount} Pending
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    {order.refundStatus === "requested" || order.refundStatus === "pending" ? (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleApproveRefund(order.id)}
                          disabled={isSyncing === order.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          {isSyncing === order.id ? (
                            <RefreshCcw size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Approve Refund
                        </button>
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter animate-pulse px-1">
                           Action Required
                        </span>
                      </div>
                  ) : order.refundStatus === "approved" ? (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() =>
                          handleProcessRefund(order.id)
                        }
                        disabled={isSyncing === order.id}
                        className="flex items-center gap-2 px-2 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isSyncing === order.id ? (
                          <RefreshCcw
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        Process Refund
                      </button>

                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter px-1">
                        Approved — Ready to Process
                      </span>
                    </div>

                    ) : order.refundStatus === "processing" ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                      <RefreshCcw
                        size={10}
                        className="animate-spin"
                      />
                      Refund Processing
                    </span>
           
               

                  ) : order.refundStatus === "completed" ||
                    order.status === "refunded" ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <CheckCircle size={10} /> Refunded
                    </span>

                     ) : order.refundStatus === "failed" ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      <XCircle size={10} />
                      Refund Failed
                    </span>



                    ) : order.refundStatus === "rejected" ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <XCircle size={10} /> Declined
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                        No Requests
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/dashboard/admins/orders/${order.id}`}>
                      <button className="p-3 bg-[#F8F8F8] text-[#002B5B] rounded-xl hover:bg-[#002B5B] hover:text-white transition-all shadow-sm active:scale-90">
                        <Eye size={16} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-[#F8F8F8] border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#4B4B4B]">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-[#F7931E] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-[#F7931E] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}