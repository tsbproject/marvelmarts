// "use client";

// import { useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import RecentOrdersTable from "../_components/RecentOrdersTable";

// export default function MyOrdersPage() {
//   const { status } = useSession();
//   const router = useRouter();
  
//   const { orders } = useSelector((state: RootState) => state.orders);
//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

//   // Handle Redirect for unauthenticated users
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       // Encodes the URL to prevent "Rejection" by the browser/auth server
//       const callback = encodeURIComponent("/account/customer/orders");
//       router.push(`/auth/sign-in?callbackUrl=${callback}`);
//     }
//   }, [status, router]);

//   /**
//    * HYBRID PROTECTION:
//    * We wait for three things:
//    * 1. Next-Auth session status to stop "loading"
//    * 2. Redux to flag isAuthenticated as true
//    * 3. The Redux User object (and its ID) to be fully synced
//    */
//   if (status === "loading" || (status === "authenticated" && (!isAuthenticated || !user?.id))) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-white">
//         <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
//           Syncing Marvel Records...
//         </p>
//       </div>
//     );
//   }

//   // Prevent UI flash of protected content while redirecting
//   if (status === "unauthenticated") return null;

//   return (
//     <div className="min-h-screen">
//       <DashboardHeader title="My Orders" showLogout={true} />
//       <div className="p-4 md:p-8">
//         <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
//           <RecentOrdersTable orders={orders} />
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { setOrders } from "@/store/orderSlice";
import DashboardHeader from "@/app/_components/DashboardHeader";
import RecentOrdersTable from "../_components/RecentOrdersTable";

export default function MyOrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { orders } = useSelector((state: RootState) => state.orders);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // 1. Handle Redirect for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      const callback = encodeURIComponent("/account/customer/orders");
      router.push(`/auth/sign-in?callbackUrl=${callback}`);
    }
  }, [status, router]);

  // 2. FETCH LOGIC: Fetch orders from the smart /api/orders route
  useEffect(() => {
    const fetchUserOrders = async () => {
      // Only fetch if authenticated and we have a user ID synced in Redux
      if (status === "authenticated" && user?.id) {
        try {
          // We use /api/orders because it reads the user identity from the session cookie
          const res = await fetch("/api/orders");
          if (res.ok) {
            const data = await res.json();
            dispatch(setOrders(data));
          }
        } catch (error) {
          console.error("MarvelMarts Order Fetch Error:", error);
        }
      }
    };

    fetchUserOrders();
  }, [status, user?.id, dispatch]);

  /**
   * HYBRID PROTECTION:
   * Keep the branded loader visible until:
   * 1. Next-Auth session is ready
   * 2. Redux auth state is synced (isAuthenticated)
   * 3. The specific User ID is available in the store
   */
  if (status === "loading" || (status === "authenticated" && (!isAuthenticated || !user?.id))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
          Syncing Marvel Records...
        </p>
      </div>
    );
  }

  // Prevent UI flash of protected content while redirecting
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader title="My Orders" showLogout={true} />
      <div className="p-4 md:p-8">
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          {/* RecentOrdersTable will automatically display the orders synced to Redux */}
          <RecentOrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}

