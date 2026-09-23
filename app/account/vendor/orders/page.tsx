"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package,
  Loader2,
  ChevronRight
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchVendorOrders, updateOrderStatus } from "@/store/vendorSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import OrderDetailsUI from "./[id]/OrderDetailsUI";
import { formatNaira } from "@/app/lib/FormatNaira";

export default function VendorOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifySuccess, notifyError } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  /**
   * FIXED: Added shallowEqual to prevent the "Selector returned a different result" warning.
   * This ensures the component only re-renders when the actual values change.
   */
  const { orders, loading } = useSelector((state: RootState) => ({
    orders: state.vendor?.orders || [],
    loading: state.vendor?.loading || false
  }), shallowEqual);

  useEffect(() => {
    dispatch(fetchVendorOrders());
  }, [dispatch]);

  const handleOrderAction = async (
  orderId: string,
  status: "APPROVED" | "REJECTED"
) => {
  if (status === "REJECTED") {
    const confirmReject = window.confirm(
      "ARE YOU SURE YOU WANT TO REJECT THIS ORDER?"
    );

    if (!confirmReject) return;
  }

  setProcessingId(orderId);

  try {
    await dispatch(
      updateOrderStatus({
        orderId,
        status,
      })
    ).unwrap();

    notifySuccess(
      `ORDER #${orderId.slice(-6).toUpperCase()} ${status} SUCCESSFULLY.`
    );
  } catch (error: any) {
    notifyError(error || "FAILED TO UPDATE ORDER STATUS.");
  } finally {
    setProcessingId(null);
  }
};

  const filteredOrders = orders.filter((order: any) => {
    const orderId = (order.id || "").toLowerCase();
    const customerName = (order.customerName || "").toLowerCase();
    const productTitle = (order.productTitle || "").toLowerCase();
    
    const matchesSearch = 
      orderId.includes(searchTerm.toLowerCase()) || 
      customerName.includes(searchTerm.toLowerCase()) ||
      productTitle.includes(searchTerm.toLowerCase());

    const matchesFilter = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-9xl mx-auto min-h-screen bg-[#FBFBFB]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-accent-navy">
            MARVEL<span className="text-brand-primary">MARTS</span> ORDERS
          </h1>
          <p className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.3em] mt-1 bg-white w-fit px-2 py-1 rounded border border-gray-100">
            Vendor Fulfillment Center
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
          <Search size={18} className="text-neutral-gray" />
          <input 
            type="text" 
            placeholder="Search Order ID, Customer, or Product..." 
            className="outline-none text-xs font-bold w-full md:w-80 bg-transparent uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-4 rounded-3xl border transition-all text-left ${
                    statusFilter === status 
                    ? 'bg-accent-navy border-accent-navy text-white shadow-lg' 
                    : 'bg-white border-gray-100 text-accent-navy hover:border-brand-primary'
                }`}
              >
                  <p className="text-[9px] font-black uppercase opacity-60 mb-1">{status} ORDERS</p>
                  <p className="text-xl font-black">
                      {status === 'ALL' ? orders.length : orders.filter((o:any) => o.status === status).length}
                  </p>
              </button>
          ))}
      </div>

      {/* ORDERS TABLE CONTAINER */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary">
                <Filter size={16} />
            </div>
            <span className="text-[11px] font-black uppercase text-accent-navy">Fulfillment Queue</span>
          </div>
          {loading && <Loader2 size={18} className="animate-spin text-brand-primary" />}
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Item Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order: any) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id} 
                    className="group hover:bg-gray-50/80 transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-accent-navy shrink-0 group-hover:scale-110 transition-transform">
                          <Package size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-accent-navy">#{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-[11px] text-brand-primary font-black mt-0.5">{formatNaira(Number(order.total))}</p>
                          <p className="text-[9px] font-bold text-neutral-gray uppercase mt-1 truncate max-w-[150px] italic">
                             {order.productTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-md font-black text-accent-navy uppercase">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-gray font-bold uppercase tracking-tighter">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border ${
                        order.status === 'APPROVED' ? 'bg-green-50 border-green-100 text-green-600' : 
                        order.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        {order.status === "PENDING" ? (
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button 
                              disabled={processingId === order.id}
                              onClick={() => handleOrderAction(order.id, "APPROVED")}
                              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-green-600 hover:text-white rounded-xl text-green-600 transition-all shadow-sm border border-gray-100 disabled:opacity-50"
                              title="Approve Order"
                            >
                              {processingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={20} />}
                            </button>
                            <button 
                              disabled={processingId === order.id}
                              onClick={() => handleOrderAction(order.id, "REJECTED")}
                              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-600 hover:text-white rounded-xl text-red-600 transition-all shadow-sm border border-gray-100 disabled:opacity-50"
                              title="Reject Order"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent-navy hover:text-white rounded-xl text-accent-navy text-[10px] font-black uppercase transition-all"
                          >
                            <Eye size={16} /> Details <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {!loading && filteredOrders.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                <ShoppingCart size={40} className="text-gray-200" />
              </div>
              <h3 className="text-lg font-black text-accent-navy uppercase">No Results Found</h3>
              <p className="text-[10px] font-black uppercase text-neutral-gray tracking-[0.3em] mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SIDE-DRAWER DETAIL VIEW */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-accent-navy/40 backdrop-blur-sm z-[90]"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl z-[100] bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <OrderDetailsUI 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                isDrawer={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}