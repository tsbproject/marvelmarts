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
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      const callback = encodeURIComponent("/account/customer/orders");
      router.push(`/auth/sign-in?callbackUrl=${callback}`);
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (status === "authenticated" && user?.id) {
        try {
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

  if (
    status === "loading" ||
    (status === "authenticated" && (!isAuthenticated || !user?.id))
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
          Syncing Marvel Records...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen">
      <DashboardHeader title="My Orders" showLogout={true} />
      <div className="p-4 md:p-8">
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          <RecentOrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}