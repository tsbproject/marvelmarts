"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package,
  Loader2
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchVendorOrders, updateOrderStatus } from "@/store/vendorSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifySuccess, notifyError } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Accessing Redux state
const { orders, loading } = useSelector((state: RootState) => ({
  orders: state.vendor?.orders || [],
  loading: state.vendor?.loading || false
}));

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchVendorOrders());
  }, [dispatch]);

  // Merged Approve and Reject Logic
  // Inside VendorOrdersPage component
const handleOrderAction = async (orderId: string, status: "APPROVED" | "REJECTED") => {
  let trackingNumber = "";

  if (status === "APPROVED") {
    const userInput = window.prompt("Enter Tracking Number (Optional):");
    if (userInput === null) return; // Vendor cancelled the action
    trackingNumber = userInput;
  }

  setProcessingId(orderId);
  try {
    await dispatch(updateOrderStatus({ orderId, status, trackingNumber })).unwrap();
    notifySuccess(`Order #${orderId.slice(-6)} updated.`);
  } catch (error: any) {
    notifyError(error);
  } finally {
    setProcessingId(null);
  }
};
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-[#002B5B]">
            Store <span className="text-[#F7931E]">Orders</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
            Fulfillment Dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            className="outline-none text-xs font-bold p-2 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-[#002B5B]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {loading && <Loader2 size={16} className="animate-spin text-[#F7931E]" />}
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Order Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order: any) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={order.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#002B5B]">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase">#{order.id.slice(-6)}</p>
                          <p className="text-[10px] text-[#F7931E] font-black">₦{order.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-700">{order.customerName}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        order.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                        order.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "PENDING" ? (
                          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                            <button 
                              disabled={processingId === order.id}
                              onClick={() => handleOrderAction(order.id, "APPROVED")}
                              className="p-2 hover:bg-white rounded-lg text-green-600 transition-all hover:shadow-sm disabled:opacity-50"
                            >
                              {processingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            </button>
                            <button 
                              disabled={processingId === order.id}
                              onClick={() => handleOrderAction(order.id, "REJECTED")}
                              className="p-2 hover:bg-white rounded-lg text-red-600 transition-all hover:shadow-sm disabled:opacity-50"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <button className="p-2 text-gray-400 hover:text-[#002B5B] hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye size={18} />
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
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={30} className="text-gray-200" />
              </div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No Orders Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}