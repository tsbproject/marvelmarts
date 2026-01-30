




export const dynamic = "force-dynamic";

import { prisma } from "@/app/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { 
  Activity, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import Link from "next/link";
import ExportButtons from "@/app/_components/admins/ExportButtons";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string; // New filter param
  };
}

export default async function ActivityPage({ searchParams }: PageProps) {

    const currentSearch = searchParams.search || "";
    const currentPage = searchParams.page || "1";
  
    // 1. Initialize Basic Variables
  const page = Number(searchParams.page) || 1;
  const query = searchParams.search || "";
  const statusFilter = searchParams.status || "all";
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // 2. Define the Helper Function (Must be BEFORE the JSX)
  const getFilterHref = (status: string) => {
  return {
    pathname: "/dashboard/admins/activity",
    query: { 
      status: status,
      search: currentSearch, // Use the plain string variable
      page: 1                // Always reset to 1 on filter change
    }
  };
};

  // 3. Build Prisma Query
  const whereClause: any = {
    AND: [
      query ? {
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' as const } },
          { firstName: { contains: query, mode: 'insensitive' as const } },
          { lastName: { contains: query, mode: 'insensitive' as const } },
        ]
      } : {},
      statusFilter === "paid" ? { paymentStatus: true } : 
      statusFilter === "pending" ? { paymentStatus: false } : {}
    ]
  };

  // 4. Fetch Data
  const [rawActivities, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      take: pageSize,
      skip: skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        firstName: true,
        lastName: true,
        paymentStatus: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.order.count({ where: whereClause })
  ]);

  // 5. Serialize Data (Fixes Decimal error)
  const activities = rawActivities.map((order) => ({
    ...order,
    total: Number(order.total),
  }));

  // 6. Calculate Totals (Fixes ReferenceError)
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Export */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Activity size={20} />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-950">
              Live <span className="text-indigo-600">Feed</span>
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Showing {activities.length} of {totalCount} Transactions
          </p>
        </div>
       {/* Use the serialized data here */}
        <ExportButtons data={activities} />
       </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <form method="GET" className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              name="search"
              defaultValue={query}
              placeholder="Search orders..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:border-indigo-600 font-bold text-sm"
            />
            {/* Hidden input to preserve status when searching */}
            <input type="hidden" name="status" value={statusFilter} />
          </form>
        </div>

        {/* Status Filter Pills */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-auto">
          {[
            { label: "All", value: "all" },
            { label: "Paid", value: "paid" },
            { label: "Pending", value: "pending" }
          ].map((tab) => (
            <Link
              key={tab.value}
              href={getFilterHref(tab.value)}
              className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                statusFilter === tab.value 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Activity List Container */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* List Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
             <Filter size={14} className="text-indigo-600" />
             <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
               Filtered by: {statusFilter}
             </span>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">
            PAGE {page} / {totalPages || 1}
          </span>
        </div>

        {/* List Items (Same mapping as before) */}
        <div className="divide-y divide-gray-50">
          {activities.length > 0 ? (
            activities.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${order.paymentStatus ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-gray-900 uppercase tracking-tight">{order.firstName} {order.lastName}</h3>
                      {order.paymentStatus ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                    </div>
                    <p className="text-xs font-bold text-gray-400">
                      Order <span className="text-indigo-600">#{order.orderNumber}</span> • {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end md:gap-12 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <p className="text-xl font-black text-gray-950 tracking-tighter">₦{Number(order.total).toLocaleString()}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.paymentStatus ? 'Confirmed' : 'Pending'}
                    </p>
                  </div>
                  <Link href={`/dashboard/admins/orders/${order.id}`} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest">No activities found matching these filters</p>
            </div>
          )}
        </div>

       {/* Pagination Controls */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center gap-4">
        {/* PREVIOUS PAGE LINK */}
        <Link
            href={`?status=${statusFilter}&search=${query}&page=${page > 1 ? page - 1 : 1}`}
            className={`p-3 rounded-xl border border-gray-200 transition-all ${
            page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white bg-white shadow-sm hover:border-indigo-600 text-indigo-600'
            }`}
        >
            <ChevronLeft size={20} />
        </Link>
        
        <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => {
            const pNum = i + 1;
            if (pNum === 1 || pNum === totalPages || (pNum >= page - 1 && pNum <= page + 1)) {
                return (
                <Link
                    key={pNum}
                    href={`?status=${statusFilter}&search=${query}&page=${pNum}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${
                    page === pNum ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-600'
                    }`}
                >
                    {pNum}
                </Link>
                );
            }
            return null;
            })}
        </div>

        {/* NEXT PAGE LINK */}
        <Link
            href={`?status=${statusFilter}&search=${query}&page=${page < totalPages ? page + 1 : totalPages}`}
            className={`p-3 rounded-xl border border-gray-200 transition-all ${
            page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-white bg-white shadow-sm hover:border-indigo-600 text-indigo-600'
            }`}
        >
            <ChevronRight size={20} />
        </Link>
        </div>
      </div>
    </div>
  );
}