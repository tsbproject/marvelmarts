


// "use client";

// import React from "react";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
// import { RejectedView } from "@/app/_components/RejectedView";

// export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const { data: session, status: authStatus } = useSession();

//   // 1. Determine the zone
//   const isVendorZone = pathname.includes("/account/vendor");
//   const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";

//   // 2. Extract Vendor Status
//   const vendorStatus = session?.user?.vendorStatus; 
//   // Ensure reason is a string or undefined for the component prop
//   const rejectionReason = session?.user?.rejectionReason || undefined;

//   // 3. Logic: Should we gate the vendor content?
//   // We only show the full dashboard if status is explicitly "APPROVED"
//   const isApproved = vendorStatus === "APPROVED";
//   const showGatedView = isVendorZone && !isApproved && authStatus === "authenticated";

//   return (
//     <div className="flex min-h-screen bg-[#FBFBFB]">
//       {/* Hide Sidebar completely for unapproved vendors. 
//           This removes the dark bar you saw on the left of your screenshot.
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
//           <div className="min-h-screen flex items-center justify-center bg-white">
//             {/* If the status is specifically REJECTED, show RejectedView.
//                 For any other non-approved state (PENDING, null, or undefined), 
//                 show PendingApprovalView.
//             */}
//             {vendorStatus === "REJECTED" ? (
//               <RejectedView 
//                 reason={rejectionReason} 
//                 email={session?.user?.email} 
//               />
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
  const rejectionReason = session?.user?.rejectionReason || undefined;

  // 3. Logic: Should we gate the vendor content?
  // UPDATED: We now allow access if the status is APPROVED *OR* PENDING.
  // This ensures vendors can see the onboarding steps while their application is in review.
  const canAccessDashboard = vendorStatus === "APPROVED" || vendorStatus === "PENDING";
  
  const showGatedView = isVendorZone && !canAccessDashboard && authStatus === "authenticated";

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {/* Hide Sidebar completely for unapproved vendors (REJECTED or Null status). 
          For PENDING and APPROVED, the sidebar remains visible.
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
                For any other status that blocked access, show PendingApprovalView.
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