"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { customerSections } from "@/types/dashboardSections";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Handle Loading & Authentication
  if (status === "loading") return null; 
  if (status === "unauthenticated") redirect("/auth/sign-in");

  // Type Casting to bypass the Strict Index Signature error in Vercel
  const sectionsData = customerSections as any;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9FAFB]">
      
      {/* MOBILE NAVIGATION */}
      <div className="lg:hidden sticky top-0 z-50">
        <MobileTopbar 
          role="Customer" 
          sections={sectionsData} 
          user={session?.user}
        />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block border-r border-gray-200 bg-white w-64 fixed h-full z-40">
        <DashboardSidebar 
          sections={sectionsData} 
          user={session?.user}
          role="Customer"
        />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 relative">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}