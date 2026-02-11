"use client";

import React from "react";
import CustomerSidebar from "@/app/_components/AccountSidebar";
import { useSession } from "next-auth/react";

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Customer Top Nav */}
      <nav className="h-16 border-b flex items-center px-8 sticky top-0 bg-white z-40">
        <h2 className="font-black text-xl italic uppercase">MarvelMarts<span className="text-indigo-600">.</span></h2>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Customer Specific Sidebar */}
        <aside className="w-full lg:w-64 border-r border-gray-100 bg-gray-50/30">
          <CustomerSidebar />
        </aside>

        {/* Account Content */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}