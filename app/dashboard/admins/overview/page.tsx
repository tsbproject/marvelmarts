"use client";



import { useSelector, useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
import { RootState } from "@/store";
import { setOrders } from "@/store/orderSlice"; 
import DashboardHeader from "@/app/_components/DashboardHeader";
import StatsGrid from "@/app/_components/StatsGrid";
import { Plus, ArrowRight, MessageSquareQuote, ShoppingBag } from "lucide-react";
import Link from "next/link";
import RevenueChart from "@/app/_components/RevenueChat";
import OrderStatusBadge from "@/app/_components/admins/OrderStatusBadge";

export default function DashboardOverview() {
  const dispatch = useDispatch();

  // 1. Get data from Redux safely
  const orders = useSelector((state: RootState) => (state as any).orders?.orders || (state as any).order?.orders || []);
   const reviews = useSelector((state: RootState) => state.admin.reviews || []);

  const allOrders = useSelector((state: RootState) => state.orders.orders || []);



  // 2. The Data Fetcher
 useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admins/orders');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // IMPORTANT: Your Prisma query returns { user: { name: "..." } }
      // We map it here to match your Order interface's 'customerName'
      const formattedOrders = data.map((order: any) => ({
        ...order,
        customerName: order.customerName || order.user?.name || "Guest Pilot",
      }));

      dispatch(setOrders(formattedOrders));
    } catch (error) {
      console.error("Order fetch failed:", error);
    }
  };

  fetchOrders();
}, [dispatch]);

  const pendingReviews = useMemo(() => {
  return Array.isArray(reviews) 
    ? reviews.filter((r: any) => !r.approved).slice(0, 3) 
    : [];
}, [reviews]);


{(!pendingReviews || pendingReviews.length === 0) ? (
  <p className="text-[10px] text-center py-8 font-bold text-gray-400 uppercase tracking-widest">
    All Clear • No Pending Reviews
  </p>
) : (
  pendingReviews.map((review: any) => (
    <div key={review.id} className="group">
      {/* Your review content */}
    </div>
  ))
)}

  // 3. Derived values (Memoized to prevent the console warnings you saw)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [orders]);


  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader 
        title="Overview"
        showAddButton={true}
        addButtonLabel="New Product"
        showLogout={false}
        showNotificationBell={false}
        addButtonLink="/dashboard/admins/products/new"
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsGrid />

        <div className="grid grid-cols-1 gap-8 mt-8">
          {/* Added a height wrapper to fix your RevenueChart "height -1" error */}
          <div className="min-h-[400px] w-full bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <RevenueChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight text-[#002B5B]">Recent Orders</h3>
              <Link href="/dashboard/admins/orders" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-gray-100/50 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#002B5B]">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#002B5B] uppercase">{order.customerName || `Order #${order.id.slice(-5)}`}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                           {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₦{order.total?.toLocaleString()}</p>
                      <OrderStatusBadge orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Waiting for incoming orders...</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Tactical Actions */}
            <div className="bg-[#002B5B] rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Tactical Actions</h3>
                <div className="grid gap-3 mt-4">
                  <Link href="/dashboard/admins/categories" className="w-full py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-between group">
                    Categories <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Review Intel */}
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
               <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-6 flex items-center gap-2">
                 <MessageSquareQuote size={18} className="text-[#F7931E]" /> Review Intel
               </h3>
               <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <p className="text-[10px] text-center py-4 font-bold text-gray-400 uppercase">All Clear</p>
                ) : (
                  pendingReviews.map((review: any) => (
                    <div key={review.id} className="group">
                      <p className="text-[10px] font-black text-[#002B5B] uppercase truncate">{review.product?.title}</p>
                      <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-1">"{review.body}"</p>
                    </div>
                  ))
                )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// "use client";

// import { useSelector, useDispatch } from "react-redux";
// import { useEffect, useMemo } from "react";
// import { RootState } from "@/store";
// import { setOrders } from "@/store/orderSlice"; 
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import StatsGrid from "@/app/_components/StatsGrid";
// import { Plus, ArrowRight, MessageSquareQuote, ShoppingBag } from "lucide-react";
// import Link from "next/link";
// import RevenueChart from "@/app/_components/RevenueChat";
// import OrderStatusBadge from "@/app/_components/admins/OrderStatusBadge";

// export default function DashboardOverview() {
//   const dispatch = useDispatch();

//   // 1. Get data from Redux safely
//   const orders = useSelector((state: RootState) => (state as any).orders?.orders || (state as any).order?.orders || []);
//    const reviews = useSelector((state: RootState) => state.admin.reviews || []);

//   const allOrders = useSelector((state: RootState) => state.orders.orders || []);



//   // 2. The Data Fetcher
//  useEffect(() => {
//   const fetchOrders = async () => {
//     try {
//       const response = await fetch('/api/admins/orders');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const data = await response.json();

//       // IMPORTANT: Your Prisma query returns { user: { name: "..." } }
//       // We map it here to match your Order interface's 'customerName'
//       const formattedOrders = data.map((order: any) => ({
//         ...order,
//         customerName: order.customerName || order.user?.name || "Guest Pilot",
//       }));

//       dispatch(setOrders(formattedOrders));
//     } catch (error) {
//       console.error("Order fetch failed:", error);
//     }
//   };

//   fetchOrders();
// }, [dispatch]);

//   const pendingReviews = useMemo(() => {
//   return Array.isArray(reviews) 
//     ? reviews.filter((r: any) => !r.approved).slice(0, 3) 
//     : [];
// }, [reviews]);


// {(!pendingReviews || pendingReviews.length === 0) ? (
//   <p className="text-[10px] text-center py-8 font-bold text-gray-400 uppercase tracking-widest">
//     All Clear • No Pending Reviews
//   </p>
// ) : (
//   pendingReviews.map((review: any) => (
//     <div key={review.id} className="group">
//       {/* Your review content */}
//     </div>
//   ))
// )}

//   // 3. Derived values (Memoized to prevent the console warnings you saw)
//   const recentOrders = useMemo(() => {
//     return [...orders]
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//       .slice(0, 4);
//   }, [orders]);

//   return (
//     <div className="space-y-8 pb-12">
//       <DashboardHeader title="Overview" showAddButton addButtonLabel="New Product" addButtonLink="/dashboard/admins/products/new" />
      
//       <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
//         <StatsGrid />
        
//         <div className="grid grid-cols-1 gap-8 mt-8">
//           <div className="min-h-[400px] w-full bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
//             <RevenueChart />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
//           <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
//             <div className="flex justify-between items-center mb-8">
//               <h3 className="text-lg font-black uppercase tracking-tight text-[#002B5B]">Recent Orders</h3>
//               <Link href="/dashboard/admins/orders" className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2">
//                 View All <ArrowRight size={14} />
//               </Link>
//             </div>

//             <div className="space-y-4">
//               {recentOrders.length > 0 ? (
//                 recentOrders.map((order: any) => (
//                   <div key={order.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50 border border-gray-100/50">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#002B5B]">
//                         <ShoppingBag size={20} />
//                       </div>
//                       <div>
//                         {/* Note: This uses order.user.name from the Prisma 'include' we added */}
//                         <p className="font-black text-sm text-[#002B5B] uppercase">
//                           {order.user?.name || "Guest Customer"}
//                         </p>
//                         <p className="text-[10px] text-gray-400 font-bold uppercase">
//                           {new Date(order.createdAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-black text-gray-900">₦{order.total?.toLocaleString()}</p>
//                       <OrderStatusBadge orderId={order.id} currentStatus={order.status} />
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
//                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
//                     {orders.length === 0 ? "No orders found in database" : "Loading orders..."}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//         {/* Review Intel */}
//             <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
//                 <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-6 flex items-center gap-2">
// //                  <MessageSquareQuote size={18} className="text-[#F7931E]" /> Review Intel
//                 </h3>
//                <div className="space-y-4">
//                 {pendingReviews.length === 0 ? (
//                   <p className="text-[10px] text-center py-4 font-bold text-gray-400 uppercase">All Clear</p>
//                 ) : (
//                   pendingReviews.map((review: any) => (
//                     <div key={review.id} className="group">
//                       <p className="text-[10px] font-black text-[#002B5B] uppercase truncate">{review.product?.title}</p>
//                       <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-1">"{review.body}"</p>
//                     </div>
//                   ))
//                 )}
//                </div>
//             </div>
//           </div>
//         </div>
//       </div>

//   );
// }