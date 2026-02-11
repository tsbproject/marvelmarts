"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, ArrowRight, Clock, User } from "lucide-react";

export default function RefundQueueTable({ requests }: { requests: any[] }) {
  const router = useRouter();

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200">
        <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="text-gray-300" size={32} />
        </div>
        <h3 className="font-black uppercase italic text-gray-900 tracking-tighter text-xl">No Pending Requests</h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">All missions are currently stable.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
          <AlertCircle className="text-orange-500" size={20} /> Refund <span className="text-orange-500">Queue</span>
        </h2>
        <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">
          {requests.length} Actions Required
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <th className="px-8 py-4">Order Ref</th>
              <th className="px-8 py-4">Customer</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4">Request Date</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-black text-xs text-gray-900 block">#{order.orderNumber}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tactical Gear</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: '#002B5B' }}>
                      {order.firstName[0]}{order.lastName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{order.firstName} {order.lastName}</span>
                      <span className="text-[10px] text-gray-400 lowercase">{order.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black text-sm text-gray-900 italic">₦{Number(order.total).toLocaleString()}</span>
                </td>
                <td className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => router.push(`/dashboard/admins/orders/${order.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-orange-200"
                  >
                    Review <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}