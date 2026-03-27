"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { setOrders, Order } from "@/store/orderSlice";
import { RootState } from "@/store";

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders: initialOrders }: RecentOrdersTableProps) {
  const dispatch = useDispatch();

  const reduxOrders = useSelector((state: RootState) => state.orders.orders);

  const displayOrders = reduxOrders.length > 0 ? reduxOrders : initialOrders;

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      dispatch(setOrders(initialOrders));
    }
  }, [initialOrders, dispatch]);

  const nairaFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  if (!displayOrders || displayOrders.length === 0) {
    return (
    <div className="py-32 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
      <div className="w-16 h-16 bg-neutral-light/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">📦</span>
      </div>
      <p className="text-neutral-gray font-black uppercase tracking-widest text-xs">
        No orders found in your Marvel records.
      </p>
      <Link 
        href="/" 
        className="mt-6 inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-navy transition-all shadow-lg shadow-brand-primary/20"
      >
        Start Shopping <span className="text-sm">→</span>
      </Link>
    </div>
  );
}

return (
  <div className="w-full">
    {/* --- Desktop Table View (Visible on md and up) --- */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-neutral-gray text-[10px] font-black uppercase tracking-[0.2em]">
            <th className="pb-4 px-4">Order Number</th>
            <th className="pb-4 px-4">Status</th>
            <th className="pb-4 px-4">Total Amount</th>
            <th className="pb-4 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {displayOrders.map((order) => (
            <tr
              key={order.id}
              className="bg-white group hover:shadow-md hover:shadow-gray-200/50 transition-all duration-300"
            >
              <td className="py-6 px-4 first:rounded-l-[1.5rem] border-y border-l border-gray-100 group-hover:border-brand-primary/20">
                <div className="flex items-center gap-1">
                  <span className="text-neutral-gray/40 font-black text-xs uppercase italic">M-</span>
                  <span className="text-accent-navy font-black text-sm tracking-tight">{order.orderNumber}</span>
                </div>
              </td>

              <td className="py-6 px-4 border-y border-gray-100 group-hover:border-brand-primary/20">
                <span
                  className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ring-1 ring-inset ${
                    order.status === "delivered"
                      ? "bg-green-50 text-green-700 ring-green-600/10"
                      : order.status === "cancelled" || order.status === "refunded"
                      ? "bg-red-50 text-red-600 ring-red-600/10"
                      : "bg-brand-light/40 text-brand-primary ring-brand-primary/10"
                  }`}
                >
                  {order.status}
                </span>
              </td>

              <td className="py-6 px-4 border-y border-gray-100 group-hover:border-brand-primary/20">
                <span className="text-accent-navy font-black text-base tracking-tighter">
                  {nairaFormatter.format(Number(order.total))}
                </span>
              </td>

              <td className="py-6 px-4 text-right last:rounded-r-[1.5rem] border-y border-r border-gray-100 group-hover:border-brand-primary/20">
                <Link
                  href={`/account/customer/orders/${order.orderNumber}`}
                  className="inline-flex items-center bg-gray-50 text-neutral-gray group-hover:bg-brand-primary group-hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Details
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* --- Mobile Card View (Visible on sm and below) --- */}
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {displayOrders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[9px] font-black text-neutral-gray/60 uppercase tracking-widest mb-1">Order Ref</p>
              <h3 className="text-accent-navy font-black text-sm tracking-tight">#{order.orderNumber}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-brand-light text-brand-primary"
              }`}
            >
              {order.status}
            </span>
          </div>
          
          <div className="flex items-end justify-between border-t border-gray-50 pt-4 mt-4">
            <div>
              <p className="text-[9px] font-black text-neutral-gray/60 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-accent-navy font-black text-xl tracking-tighter italic">
                {nairaFormatter.format(Number(order.total))}
              </p>
            </div>
            <Link
              href={`/account/customer/orders/${order.orderNumber}`}
              className="h-12 w-12 bg-brand-light flex items-center justify-center rounded-2xl text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}