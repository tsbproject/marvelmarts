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
      <div className="py-20 text-center">
        <p className="text-neutral-gray font-black uppercase tracking-widest text-xs">
          No orders found in your Marvel records.
        </p>
        <Link href="/" className="mt-4 inline-block text-brand-primary font-bold hover:underline">
          Start Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-neutral-gray text-sm uppercase tracking-widest">
            <th className="pb-4 px-2 font-black">Order Number</th>
            <th className="pb-4 px-2 font-black">Status</th>
            <th className="pb-4 px-2 font-black">Total</th>
            <th className="pb-4 px-2 font-black text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayOrders.map((order) => (
            <tr
              key={order.id}
              className="text-accent-navy font-medium group hover:bg-neutral-light/40 transition-all duration-300"
            >
              <td className="py-5 px-2 font-bold">
                <span className="text-neutral-gray/50 text-xs">#</span>
                {order.orderNumber}
              </td>

              <td className="py-5 px-2">
                <span
                  className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled" || order.status === "refunded"
                      ? "bg-red-50 text-red-600"
                      : "bg-brand-light text-brand-primary"
                  }`}
                >
                  {order.status}
                </span>
              </td>

              <td className="py-5 px-2 font-black text-accent-navy text-lg">
                {nairaFormatter.format(Number(order.total))}
              </td>

              <td className="py-5 px-2 text-right">
                <Link
                  href={`/account/customer/orders/${order.orderNumber}`}
                  className="group/link inline-flex items-center text-brand-primary hover:text-accent-navy text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  View Details
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}