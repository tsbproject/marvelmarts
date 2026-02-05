



// "use client";

// import MobileTopbar from "@/app/_components/MobileTopbar";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import { vendorSections } from "@/types/dashboardSections";

// export default function VendorLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-light">
//       {/* MOBILE NAVIGATION */}
//       <div className="lg:hidden sticky top-0 z-50">
//         <MobileTopbar role="Vendor" sections={vendorSections} />
//       </div>

//       {/* DESKTOP SIDEBAR - Fixed */}
//       <aside className="hidden lg:block border-r border-gray-200 bg-neutral-white w-64 fixed h-full z-40">
//         <DashboardSidebar sections={vendorSections} />
//       </aside>

//       {/* MAIN CONTENT AREA */}
//       <div className="flex-1 flex flex-col lg:ml-64 min-w-0 relative">
//         <main className="flex-1">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }





"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { vendorSections } from "@/types/dashboardSections";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // 1. Security & Loading States
  if (status === "loading") return null;
  if (status === "unauthenticated") redirect("/auth/sign-in");

  // 2. Type Casting for Build Success
  const sectionsData = vendorSections as any;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9FAFB]">
      
      {/* MOBILE NAVIGATION */}
      <div className="lg:hidden sticky top-0 z-50">
        <MobileTopbar 
          role="Vendor" 
          sections={sectionsData} 
          user={session?.user} 
        />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block border-r border-gray-200 bg-white w-64 fixed h-full z-40">
        <DashboardSidebar 
          sections={sectionsData} 
          role="Vendor" 
          user={session?.user} 
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