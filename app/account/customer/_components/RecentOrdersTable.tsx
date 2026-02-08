



// "use client";

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Link from "next/link";
// import { setOrders, Order } from "@/store/orderSlice"; 
// import { RootState } from "@/store";
// import RefundRequestButton from "./RefundRequestButton";

// interface RecentOrdersTableProps {
//   orders: Order[];
// }

// export default function RecentOrdersTable({ orders: initialOrders }: RecentOrdersTableProps) {
//   const dispatch = useDispatch();
  
//   // Connect to Redux to ensure the table stays in sync after initial load
//   const reduxOrders = useSelector((state: RootState) => state.orders.orders);
  
//   // Use Redux orders if they exist, otherwise fallback to the initial prop
//   const displayOrders = reduxOrders.length > 0 ? reduxOrders : initialOrders;

//   // Sync server-fetched data to Redux store on mount
//   useEffect(() => {
//     if (initialOrders && initialOrders.length > 0) {
//       dispatch(setOrders(initialOrders));
//     }
//   }, [initialOrders, dispatch]);

//   // Currency Formatter for Naira
//   const nairaFormatter = new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 0,
//   });

//   // Empty State Logic
//   if (!displayOrders || displayOrders.length === 0) {
//     return (
//       <div className="py-20 text-center">
//         <p className="text-neutral-gray font-black uppercase tracking-widest text-xs">
//           No orders found in your Marvel records.
//         </p>
//         <Link href="/" className="mt-4 inline-block text-brand-primary font-bold hover:underline">
//           Start Shopping →
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left border-separate border-spacing-y-2">
//         <thead>
//           <tr className="text-neutral-gray text-sm uppercase tracking-widest">
//             <th className="pb-4 px-2 font-black">Order ID</th>
//             <th className="pb-4 px-2 font-black">Status</th>
//             <th className="pb-4 px-2 font-black">Total</th>
//             <th className="pb-4 px-2 font-black text-right">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100">
//           {displayOrders.map((order) => (
//             <tr 
//               key={order.id} 
//               className="text-accent-navy font-medium group hover:bg-neutral-light/40 transition-all duration-300"
//             >
//               <td className="py-5 px-2 font-bold">
//                 <span className="text-neutral-gray/50 text-xs">#</span>
//                 {order.id.slice(-6).toUpperCase()}
//               </td>
              
//               <td className="py-5 px-2">
//                 <div className="flex flex-col gap-1">
//                   <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
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

//               <td className="py-5 px-2 font-black text-accent-navy text-lg">
//                 {nairaFormatter.format(order.total)}
//               </td>

//               <td className="py-5 px-2 text-right">
//                 <div className="flex flex-col items-end gap-3">
//                   <Link 
//                     href={`/account/customer/orders/${order.id}`} 
//                     className="group/link flex items-center text-brand-primary hover:text-accent-navy text-[11px] font-black uppercase tracking-widest transition-all"
//                   >
//                     View Details
//                     <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
//                   </Link>
                  
//                   {/* Visible Refund Action - Logic handled within the button component */}
//                   <div className="pt-1 border-t border-gray-50 w-full flex justify-end">
//                     <RefundRequestButton 
//                       orderId={order.id} 
//                       orderStatus={order.status} 
//                       // Fallback to "none" if refundStatus is missing from the DB record
//                       refundStatus={(order as any).refundStatus || "none"} 
//                     />
//                   </div>
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
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { setOrders, Order } from "@/store/orderSlice"; 
import { RootState } from "@/store";

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders: initialOrders }: RecentOrdersTableProps) {
  const dispatch = useDispatch();
  
  // Connect to Redux to ensure the table stays in sync
  const reduxOrders = useSelector((state: RootState) => state.orders.orders);
  
  // Use Redux orders if they exist, otherwise fallback to prop
  const displayOrders = reduxOrders.length > 0 ? reduxOrders : initialOrders;

  // Sync server-fetched data to Redux on mount
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
            <th className="pb-4 px-2 font-black">Order ID</th>
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
                {order.id.slice(-6).toUpperCase()}
              </td>
              
              <td className="py-5 px-2">
                <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  order.status === 'delivered' 
                    ? 'bg-green-100 text-green-700' 
                    : order.status === 'cancelled' || order.status === 'refunded'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-brand-light text-brand-primary'
                }`}>
                  {order.status}
                </span>
              </td>

              <td className="py-5 px-2 font-black text-accent-navy text-lg">
                {nairaFormatter.format(order.total)}
              </td>

              <td className="py-5 px-2 text-right">
                <Link 
                  href={`/account/customer/orders/${order.id}`} 
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