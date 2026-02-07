// "use client";

// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import Link from "next/link";
// import { setOrders, Order } from "@/store/orderSlice"; 
// import RefundRequestButton from "./RefundRequestButton";

// interface RecentOrdersTableProps {
//   orders: Order[];
// }

// export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
//   const dispatch = useDispatch();

//   // Sync server-fetched data to Redux store on mount
//   useEffect(() => {
//     if (orders) {
//       dispatch(setOrders(orders));
//     }
//   }, [orders, dispatch]);

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left">
//         <thead>
//           <tr className="text-neutral-gray text-sm uppercase tracking-wider">
//             <th className="pb-4 font-black">Order ID</th>
//             <th className="pb-4 font-black">Status</th>
//             <th className="pb-4 font-black">Total</th>
//             <th className="pb-4 font-black text-right">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100">
//           {orders.map((order) => (
//             <tr key={order.id} className="text-accent-navy font-medium group hover:bg-neutral-light/30 transition-colors">
//               <td className="py-5 font-bold">
//                 #{order.id.slice(-6).toUpperCase()}
//               </td>
//               <td className="py-5">
//                 <div className="flex flex-col gap-1">
//                   <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                     order.status === 'delivered' 
//                       ? 'bg-green-100 text-green-700' 
//                       : order.status === 'cancelled' || order.status === 'refunded'
//                       ? 'bg-red-50 text-red-600'
//                       : 'bg-brand-light text-brand-primary'
//                   }`}>
//                     {order.status}
//                   </span>
//                 </div>
//               </td>
//               <td className="py-5 font-black text-accent-navy">
//                 ${order.total.toLocaleString()}
//               </td>
//               <td className="py-5 text-right">
//                 <div className="flex flex-col items-end gap-2">
//                   <Link 
//                     href={`/account/customer/orders/${order.id}`} 
//                     className="text-brand-primary hover:text-accent-navy text-sm font-black uppercase tracking-tighter transition-colors"
//                   >
//                     View Details
//                   </Link>
                  
//                   {/* Integration of Roadmap Item (a): Order refund flow */}
//                   <RefundRequestButton 
//                     orderId={order.id} 
//                     orderStatus={order.status} 
//                     refundStatus={order.refundStatus || "none"} 
//                   />
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { setOrders, Order } from "@/store/orderSlice"; 
import RefundRequestButton from "./RefundRequestButton";

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const dispatch = useDispatch();

  // Sync server-fetched data to Redux store on mount
  useEffect(() => {
    if (orders && orders.length > 0) {
      dispatch(setOrders(orders));
    }
  }, [orders, dispatch]);

  // Currency Formatter for Naira
  const nairaFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-neutral-gray text-sm uppercase tracking-widest">
            <th className="pb-4 px-2 font-black">Order ID</th>
            <th className="pb-4 px-2 font-black">Status</th>
            <th className="pb-4 px-2 font-black">Total</th>
            <th className="pb-4 px-2 font-black text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr 
              key={order.id} 
              className="text-accent-navy font-medium group hover:bg-neutral-light/40 transition-all duration-300"
            >
              <td className="py-5 px-2 font-bold">
                <span className="text-neutral-gray/50 text-xs">#</span>
                {order.id.slice(-6).toUpperCase()}
              </td>
              
              <td className="py-5 px-2">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-700' 
                      : order.status === 'cancelled' || order.status === 'refunded'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-brand-light text-brand-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </td>

              <td className="py-5 px-2 font-black text-accent-navy text-lg">
                {nairaFormatter.format(order.total)}
              </td>

              <td className="py-5 px-2 text-right">
                <div className="flex flex-col items-end gap-3">
                  <Link 
                    href={`/account/customer/orders/${order.id}`} 
                    className="group/link flex items-center text-brand-primary hover:text-accent-navy text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    View Details
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  
                  {/* Visible Refund Action - Aligned to right */}
                  <div className="pt-1 border-t border-gray-50 w-full flex justify-end">
                    <RefundRequestButton 
                      orderId={order.id} 
                      orderStatus={order.status} 
                      refundStatus={order.refundStatus || "none"} 
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}