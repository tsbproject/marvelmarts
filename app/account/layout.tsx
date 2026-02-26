// "use client";

// import React, { useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useDispatch } from "react-redux"; 
// import { setVendorData } from "@/store/vendorSlice"; 
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
// import { RejectedView } from "@/app/_components/RejectedView";
// import { ShieldAlert, Mail } from "lucide-react";

// export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { data: session, status: authStatus } = useSession();

//   // 1. GLOBAL AUTH GUARD
//   useEffect(() => {
//     if (authStatus === "unauthenticated") {
//       router.push("/auth/login"); // Ensure this matches your login route
//     }
//   }, [authStatus, router]);

//   // 2. SYNC REDUX
//   useEffect(() => {
//     if (authStatus === "authenticated" && session?.user) {
//       dispatch(setVendorData({
//         profile: session.user, 
//         onboarding: {
//           profileDone: !!session.user.name,
//           storeDone: !!session.user.vendorStatus,
//           productDone: true,
//         },
//         balance: Number(session.user.balance || 0) 
//       }));
//     }
//   }, [session, authStatus, dispatch]);

//   if (authStatus === "loading") {
//     return (
//       <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
//         <div className="animate-pulse font-black text-[#002B5B] uppercase tracking-widest text-xs">
//           Authenticating Signal...
//         </div>
//       </div>
//     );
//   }

//   const isVendorZone = pathname.includes("/account/vendor");
//   const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";
//   const vendorStatus = session?.user?.vendorStatus; 
//   const isSuspended = session?.user?.isSuspended; 
//   const rejectionReason = session?.user?.rejectionReason || undefined;

//   const canAccessDashboard = vendorStatus === "APPROVED" || vendorStatus === "PENDING";
//   const showGatedView = isVendorZone && !canAccessDashboard;

//   return (
//     <div className="flex min-h-screen bg-[#FBFBFB]">
//       {/* SIDEBAR */}
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
//         {/* SUSPENSION BANNER */}
//         {isVendorZone && isSuspended && !showGatedView && (
//           <div className="bg-red-50 border-b border-red-100 px-6 py-4">
//             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
//                   <ShieldAlert size={20} />
//                 </div>
//                 <div>
//                   <h4 className="text-[11px] font-black uppercase tracking-tighter text-red-700 leading-none">Account Restricted</h4>
//                   <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Your store and products are currently hidden.</p>
//                 </div>
//               </div>
//               <a href="mailto:support@marvelmarts.com" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all">
//                 <Mail size={14} /> Contact Admin
//               </a>
//             </div>
//           </div>
//         )}

//         <div className="flex-1">
//           {showGatedView ? (
//             <div className="min-h-screen flex items-center justify-center bg-white">
//               {vendorStatus === "REJECTED" ? (
//                 <RejectedView reason={rejectionReason} email={session?.user?.email} />
//               ) : (
//                 <PendingApprovalView />
//               )}
//             </div>
//           ) : (
//             /* CRITICAL: Ensure children are rendered here */
//             <div className="p-4 md:p-8">
//                {children}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux"; 
import { setVendorData } from "@/store/vendorSlice"; 
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { PendingApprovalView } from "@/app/_components/PendingApprovalView"; 
import { RejectedView } from "@/app/_components/RejectedView";
import { ShieldAlert, Mail, RefreshCw } from "lucide-react";

export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Destructure status and update
  const { data: session, status: authStatus, update } = useSession();

  // 1. PREVENTION REF
  // This ref ensures we don't call update() in a loop.
  // Next-Auth update() causes a session change, which triggers useEffect.
  const initialSyncDone = useRef(false);

  // 2. GLOBAL AUTH GUARD
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [authStatus, router]);

  // 3. SYNC REDUX & SESSION
  useEffect(() => {
    if (authStatus === "authenticated" && session?.user) {
      // Always sync to Redux so the UI stays reactive
      dispatch(setVendorData({
        profile: session.user, 
        onboarding: {
          profileDone: !!session.user.name,
          storeDone: !!session.user.vendorStatus,
          productDone: true,
        },
        balance: Number(session.user.balance || 0) 
      }));

      // Only perform the server-side re-fetch (update) ONCE per session mount.
      // This prevents the "Authenticating Signal" from rolling forever.
      if (!initialSyncDone.current) {
        initialSyncDone.current = true;
        update().catch((err) => console.error("Session Update Failed:", err));
      }
    }
  }, [session?.user?.id, authStatus, dispatch, update]);

  // 4. LOADING STATE
  // We only show the full-screen loader if the auth is truly 'loading'
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin text-[#F7931E]">
            <RefreshCw size={24} />
          </div>
          <div className="font-black text-[#002B5B] uppercase tracking-widest text-[10px]">
            Authenticating Signal...
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIC CONSTANTS ---
  const userRole = session?.user?.role;
  const isVendorZone = pathname.includes("/account/vendor");
  const activeZone = isVendorZone ? "VENDOR" : "CUSTOMER";
  
  const vendorStatus = session?.user?.vendorStatus; 
  const isSuspended = session?.user?.isSuspended; 
  const rejectionReason = session?.user?.rejectionReason || undefined;

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  
  // Gating Logic
  const canAccessDashboard = vendorStatus === "APPROVED" || isAdmin;
  const isWaitingApproval = vendorStatus === "PENDING" && !isAdmin;
  const showGatedView = isVendorZone && !canAccessDashboard;

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {/* SIDEBAR */}
      {!showGatedView && !isWaitingApproval && (
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
        {isVendorZone && isSuspended && (
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-tighter text-red-700 leading-none">Account Restricted</h4>
                  <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Your store and products are currently hidden from the public.</p>
                </div>
              </div>
              <a href="mailto:support@marvelmarts.com" className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                <Mail size={14} /> Contact Support
              </a>
            </div>
          </div>
        )}

        <div className="flex-1">
          {showGatedView ? (
            <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm">
              {vendorStatus === "REJECTED" ? (
                <RejectedView reason={rejectionReason} email={session?.user?.email} />
              ) : (
                <PendingApprovalView />
              )}
            </div>
          ) : (
            <div className="p-4 md:p-8 animate-in fade-in duration-500">
               {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}