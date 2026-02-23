// "use client";

// import React from "react";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
// import { RejectedView } from "@/app/_components/RejectedView";
// import { ShieldAlert, Mail } from "lucide-react"; // Added for the banner

// export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const { data: session, status: authStatus } = useSession();

//   // 1. Determine the zone
//   const isVendorZone = pathname.includes("/account/vendor");
//   const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";

//   // 2. Extract Vendor Status
//   const vendorStatus = session?.user?.vendorStatus; 
//   const isSuspended = session?.user?.isSuspended; // Extract suspension status
//   const rejectionReason = session?.user?.rejectionReason || undefined;

//   // 3. Logic: Should we gate the vendor content?
//   const canAccessDashboard = vendorStatus === "APPROVED" || vendorStatus === "PENDING";
  
//   const showGatedView = isVendorZone && !canAccessDashboard && authStatus === "authenticated";

//   return (
//     <div className="flex min-h-screen bg-[#FBFBFB]">
//       {!showGatedView && (
//         <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
//           <DashboardSidebar 
//             role={activeZone}
//             user={session?.user} 
//             sections={null} 
//           />
//         </aside>
//       )}

//       <main className="flex-1 min-w-0 flex flex-col">
//         {/* SUSPENSION BANNER - Shows at the very top of the main content area */}
//         {isVendorZone && isSuspended && !showGatedView && (
//           <div className="bg-red-50 border-b border-red-100 px-6 py-4">
//             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
//                   <ShieldAlert size={20} />
//                 </div>
//                 <div>
//                   <h4 className="text-[11px] font-black uppercase tracking-tighter text-red-700 leading-none">Account Restricted</h4>
//                   <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Your store and products are currently hidden from the public marketplace.</p>
//                 </div>
//               </div>
              
//               <a 
//                 href="mailto:support@marvelmarts.com" 
//                 className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all"
//               >
//                 <Mail size={14} />
//                 Contact Administration
//               </a>
//             </div>
//           </div>
//         )}

//         <div className="flex-1">
//           {showGatedView ? (
//             <div className="min-h-screen flex items-center justify-center bg-white">
//               {vendorStatus === "REJECTED" ? (
//                 <RejectedView 
//                   reason={rejectionReason} 
//                   email={session?.user?.email} 
//                 />
//               ) : (
//                 <PendingApprovalView />
//               )}
//             </div>
//           ) : (
//             children
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }







"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux"; 
import { setVendorData } from "@/store/vendorSlice"; 
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
import { RejectedView } from "@/app/_components/RejectedView";
import { ShieldAlert, Mail } from "lucide-react";

export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session, status: authStatus } = useSession();

  // --- Sync Redux with Session Data ---
  useEffect(() => {
    if (authStatus === "authenticated" && session?.user) {
      // We push the session data into Redux so components like 
      // WithdrawalForm can see the real balance.
      dispatch(setVendorData({
        profile: session.user, 
        onboarding: {
          profileDone: !!session.user.name,
          storeDone: !!session.user.vendorStatus,
          productDone: true, // Adjust based on your logic
        },
        // Ensure balance is cast to a number to avoid the "0" issue
        balance: Number(session.user.balance || 0) 
      }));
    }
  }, [session, authStatus, dispatch]);

  // 1. Determine the zone
  const isVendorZone = pathname.includes("/account/vendor");
  const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";

  // 2. Extract Vendor Status
  const vendorStatus = session?.user?.vendorStatus; 
  const isSuspended = session?.user?.isSuspended; 
  const rejectionReason = session?.user?.rejectionReason || undefined;

  // 3. Logic: Should we gate the vendor content?
  const canAccessDashboard = vendorStatus === "APPROVED" || vendorStatus === "PENDING";
  
  const showGatedView = isVendorZone && !canAccessDashboard && authStatus === "authenticated";

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {!showGatedView && (
        <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
          <DashboardSidebar 
            role={activeZone}
            user={session?.user} 
            sections={null} 
          />
        </aside>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        {/* SUSPENSION BANNER */}
        {isVendorZone && isSuspended && !showGatedView && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-tighter text-red-700 leading-none">Account Restricted</h4>
                  <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Your store and products are currently hidden from the public marketplace.</p>
                </div>
              </div>
              
              <a 
                href="mailto:support@marvelmarts.com" 
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all"
              >
                <Mail size={14} />
                Contact Administration
              </a>
            </div>
          </div>
        )}

        <div className="flex-1">
          {showGatedView ? (
            <div className="min-h-screen flex items-center justify-center bg-white">
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
        </div>
      </main>
    </div>
  );
}