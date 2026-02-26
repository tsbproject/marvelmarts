"use client";

import { useSession } from "next-auth/react";
import { notifySuccess, notifyError } from "@/app/utils/notifications"; // Per your saved info

export default function BalanceUpdate() {
  const { data: session, update } = useSession();

  const handleRefreshSession = async () => {
    try {
      // 1. You can pass data to the update function
      // 2. This hits the 'jwt' callback in authOptions with trigger: "update"
      await update({
        ...session,
        user: {
          ...session?.user,
          // You don't actually need to pass the balance here 
          // because your server-side 'getFreshUserData' fetches the latest DB value
        }
      });

      notifySuccess("Session synchronized with server.");
    } catch (error) {
      notifyError("Failed to refresh session data.");
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <p className="text-[10px] font-black uppercase text-gray-400">Current Balance</p>
      <h3 className="text-xl font-bold text-[#002B5B]">
        ${session?.user?.balance?.toLocaleString() || "0.00"}
      </h3>
      <button 
        onClick={handleRefreshSession}
        className="mt-2 text-[9px] font-black uppercase text-[#F7931E] hover:underline"
      >
        Sync Wallet 
      </button>
    </div>
  );
}