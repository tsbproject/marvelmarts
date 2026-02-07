"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DashboardHeader from "@/app/_components/DashboardHeader";
import RecentOrdersTable from "../_components/RecentOrdersTable";

export default function MyOrdersPage() {
  const { orders } = useSelector((state: RootState) => state.orders);

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