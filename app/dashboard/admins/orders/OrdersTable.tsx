"use client";

import { useState, useMemo } from "react";
import { Search, Eye, Package, CheckCircle2, Clock, XCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  
  const router = useRouter(); 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- REUSABLE STYLE CONSTANTS ---
  const statusColors: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    shipped: "bg-purple-50 text-purple-600 border-purple-100",
    delivered: "bg-green-50 text-green-600 border-green-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };


  // --- 1. DEEP SEARCH FILTERING ---
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const searchStr = search.toLowerCase();

      // Check Order ID & Reference
      const matchesId = 
        order.id.toLowerCase().includes(searchStr) || 
        order.orderNumber.toLowerCase().includes(searchStr);

      // Check User/Recipient Name
      const matchesUser = 
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchStr) ||
        (order.user?.name || "").toLowerCase().includes(searchStr);

      // Check Products within the order
      const matchesProduct = order.items.some((item: any) => 
        item.title?.toLowerCase().includes(searchStr)
      );

      const matchesSearch = matchesId || matchesUser || matchesProduct;
      const matchesFilter = filter === "ALL" || order.status.toUpperCase() === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, initialOrders]);

  // --- 2. PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Reset page when filtering/searching
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: string) => {
    setFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {["ALL", "PENDING", "PROCESSING", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search Order # or Email..."
            className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-xs uppercase tracking-tight"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Order Ref</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Payment</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <motion.tr layout key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-black text-gray-900 uppercase tracking-tighter">{order.orderNumber}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-800 text-sm">{order.firstName} {order.lastName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{order.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-gray-900 italic">₦{Number(order.total).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{order.items.length} Items</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${order.paymentStatus ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      <CreditCard size={10} /> {order.paymentStatus ? "Paid" : "Unpaid"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusColors[order.status] || "bg-gray-100"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => router.push(`/dashboard/admins/orders/${order.id}`)}
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}




