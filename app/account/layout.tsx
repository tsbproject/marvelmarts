"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";

export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Determine the zone
  const activeZone = pathname.includes("/account/vendor") ? "VENDOR" : "CUSTOMER";

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
        <DashboardSidebar 
          role={activeZone} // Map "activeZone" to the "role" prop the sidebar expects
          user={session?.user} 
          sections={null} // Passing null as computedSections handles the logic internally
        />
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}