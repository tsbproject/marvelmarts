// "use client";

// import React from "react";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// // Importing the views we discussed
// import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
// import { RejectedView } from "@/app/_components/RejectedView";

// export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const { data: session, status: authStatus } = useSession();

//   // 1. Determine the zone
//   const activeZone = pathname.includes("/account/vendor") ? "VENDOR" : "CUSTOMER";

//   // 2. Extract Vendor Status (assuming it's passed in the session)
//   // If your session doesn't have this yet, you'll need to update your auth options callback.
//   const vendorStatus = session?.user?.vendorStatus; // "PENDING" | "APPROVED" | "REJECTED"
//   const rejectionReason = session?.user?.rejectionReason;

//   // 3. Logic: Should we gate the vendor content?
//   const isVendorZone = activeZone === "VENDOR";
//   const isNotApproved = vendorStatus !== "APPROVED";
//   const showGatedView = isVendorZone && isNotApproved && authStatus === "authenticated";

//   return (
//     <div className="flex min-h-screen bg-[#FBFBFB]">
//       {/* Hide Sidebar for unapproved vendors to prevent them from 
//           accessing "Add Product" or "Settings" via navigation 
//       */}
//       {!showGatedView && (
//         <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
//           <DashboardSidebar 
//             role={activeZone}
//             user={session?.user} 
//             sections={null} 
//           />
//         </aside>
//       )}

//       <main className="flex-1 min-w-0">
//         {showGatedView ? (
//           <div className="h-full flex items-center justify-center bg-white">
//             {vendorStatus === "REJECTED" ? (
//               <RejectedView reason={rejectionReason} email={session?.user?.email} />
//             ) : (
//               <PendingApprovalView />
//             )}
//           </div>
//         ) : (
//           children
//         )}
//       </main>
//     </div>
//   );
// }





"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
import { RejectedView } from "@/app/_components/RejectedView";

export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();

  // 1. Determine the zone
  const isVendorZone = pathname.includes("/account/vendor");
  const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";

  // 2. Extract Vendor Status
  const vendorStatus = session?.user?.vendorStatus; 
  // Ensure reason is a string or undefined for the component prop
  const rejectionReason = session?.user?.rejectionReason || undefined;

  // 3. Logic: Should we gate the vendor content?
  // We only show the full dashboard if status is explicitly "APPROVED"
  const isApproved = vendorStatus === "APPROVED";
  const showGatedView = isVendorZone && !isApproved && authStatus === "authenticated";

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {/* Hide Sidebar completely for unapproved vendors. 
          This removes the dark bar you saw on the left of your screenshot.
      */}
      {!showGatedView && (
        <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
          <DashboardSidebar 
            role={activeZone}
            user={session?.user} 
            sections={null} 
          />
        </aside>
      )}

      <main className="flex-1 min-w-0">
        {showGatedView ? (
          <div className="min-h-screen flex items-center justify-center bg-white">
            {/* If the status is specifically REJECTED, show RejectedView.
                For any other non-approved state (PENDING, null, or undefined), 
                show PendingApprovalView.
            */}
            {vendorStatus === "REJECTED" ? (
              <RejectedView 
                reason={rejectionReason} 
                email={session?.user?.email} 
              />
            ) : (
              <PendingApprovalView />
            )}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}