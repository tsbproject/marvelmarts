// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useDispatch } from "react-redux";
// import { setVendorData } from "@/store/vendorSlice";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import MobileTopbar from "@/app/_components/MobileTopbar";
// import { PendingApprovalView } from "@/app/account/vendor/verification/_components/PendingApprovalView";
// import { RejectedView } from "@/app/_components/RejectedView";
// import SuspensionBanner from "@/app/_components/SuspensionBanner";
// import {
//   ShieldAlert,
//   Mail,
//   RefreshCw,
//   LayoutDashboard,
//   User,
//   Package,
//   Wallet,
//   Truck,
//   MessageSquare,
//   Settings,
//   ChartArea,
//   CreditCard,
//   Clock,
//   Lock
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";



// // ── Dashboard Menu Configuration ──
// const DASHBOARD_CONFIG = {
//   CUSTOMER: {
//     "Personal": [
//       { label: "My Profile", href: "/account/customer", icon: <User size={16} /> },
//       { label: "My Orders", href: "/account/customer/orders", icon: <Package size={16} /> },
//     ],
//     "Support": [
//       { label: "Messages", href: "/account/customer/messages", icon: <MessageSquare size={16} /> },
//       { label: "Settings", href: "/account/customer/Profile-settings", icon: <Settings size={16} /> },
//       { label: "Account Details", href: "/account/customer/Profile-settings", icon: <CreditCard size={16} /> },
//       { label: "Payment Methods", href: "/account/customer/Profile-settings", icon: <CreditCard size={16} /> },
//     ],
//   },
//   VENDOR: {
//     "Management": [
//       { label: "Dashboard", href: "/account/vendor/", icon: <LayoutDashboard size={16} /> },
//       { label: "My Products", href: "/account/vendor/products", icon: <Package size={16} /> },
//       { label: "Settings", href: "/account/vendor/settings", icon: <Settings size={16} /> },
//       { label: "Live Chat", href: "/account/vendor/messages", icon: <ChartArea size={16} /> },
//     ],
//     "Finances": [
//       { label: "Sales Orders", href: "/account/vendor/orders", icon: <Truck size={16} /> },
//       { label: "Wallet & Payouts", href: "/account/vendor/payouts", icon: <Wallet size={16} /> },
//       { label: "Buy Boost Credit", href: "/account/vendor/credit-boost", icon: <Wallet size={16} /> },
//     ],
//   },
// };



// export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const { data: session, status: authStatus, update } = useSession();
//   const initialSyncDone = useRef(false);


  

//   // Close sidebar on route change
//   useEffect(() => {
//     setIsSidebarOpen(false);
//   }, [pathname]);

//   // GLOBAL AUTH GUARD
//   useEffect(() => {
//     if (authStatus === "unauthenticated") {
//       router.push("/auth/sign-in");
//     }
//   }, [authStatus, router]);

//   // SYNC REDUX & SESSION
//   useEffect(() => {
//     if (authStatus === "authenticated" && session?.user) {
//       dispatch(setVendorData({
//         profile: session.user,
//         onboarding: {
//           profileDone: !!session.user.name,
//           storeDone: !!session.user.vendorStatus,
//           productDone: true,
//           payoutsDone: true
//         },
//         balance: Number(session.user.balance || 0),
//       }));

//       if (!initialSyncDone.current) {
//         initialSyncDone.current = true;
//         update().catch((err) => console.error("Session Update Failed:", err));
//       }
//     }
//   }, [session?.user?.id, authStatus, dispatch, update]);

//   // ── LOGIC CONSTANTS ───────────────────────────────────────────────────────
//   const userRole = session?.user?.role;
// const isVendorZone = pathname.includes("/account/vendor");
// const activeZone: "VENDOR" | "CUSTOMER" = isVendorZone ? "VENDOR" : "CUSTOMER";

// const vendorStatus = session?.user?.vendorStatus ?? "NOT_STARTED";
// const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"; // <-- move up

// const vendorLocked =
//   isVendorZone &&
//   !isAdmin &&
//   vendorStatus !== "APPROVED";

// const isSuspended = session?.user?.isSuspended ?? false;
// const rejectionReason = session?.user?.rejectionReason ?? undefined;

// const hasAllDocs = !!(
//   session?.user?.identityDoc &&
//   session?.user?.businessDoc &&
//   session?.user?.locationDoc
// );

// const isNewOrIncompleteVendor = isVendorZone &&
//   vendorStatus === "PENDING" &&
//   !hasAllDocs;

//   // Force redirect – unconditional effect
//   useEffect(() => {
//     if (isNewOrIncompleteVendor) {
//       router.replace("/account/vendor/verification");
//     }
//   }, [isNewOrIncompleteVendor, router, pathname]);

//   const showReviewBanner = isVendorZone && vendorStatus === "PENDING_REVIEW";
//   const showRejectedView = isVendorZone && vendorStatus === "REJECTED";
//   const showSuspendedBanner = isVendorZone && isSuspended;

//   // LOADING STATE – early return after all hooks
//   if (authStatus === "loading") {
//     return (
//       <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin text-[#F7931E]">
//             <RefreshCw size={24} />
//           </div>
//           <div className="font-black text-[#002B5B] uppercase tracking-widest text-[10px]">
//             Authenticating Signal...
//           </div>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="flex min-h-screen bg-[#FBFBFB]">
//       {/* Desktop Sidebar */}
//       {!showReviewBanner && !showRejectedView && !showSuspendedBanner && (
//         <aside className="hidden lg:flex w-61 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
//           <DashboardSidebar
//             role={activeZone}
//             user={session?.user}
//             sections={DASHBOARD_CONFIG[activeZone]}
//             vendorLocked={vendorLocked} roles={"VENDOR"}            />
//         </aside>
//       )}

//       <main className="flex-1 min-w-0 flex flex-col">
//         {/* Mobile Topbar */}
//         {!showReviewBanner && !showRejectedView && !showSuspendedBanner && (
//           <div className="block lg:hidden">
//             <MobileTopbar
//               role={activeZone}
//               user={session?.user}
//               sections={DASHBOARD_CONFIG[activeZone]}
//               vendorLocked={vendorLocked}
//               todayRevenue={isVendorZone ? Number(session?.user?.balance || 0) : 0} roles={"VENDOR"}            />
//           </div>
//         )}

//         {/* Suspension Banner */}
//         {showSuspendedBanner && (
//           <div className="bg-red-50 border-b border-red-100 px-6 py-4">
//             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
//                   <ShieldAlert size={20} />
//                 </div>
//                 <div>
//                   <h4 className="text-[11px] font-black uppercase tracking-tighter text-red-700 leading-none">
//                     Account Restricted
//                   </h4>
//                   <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">
//                     Your store and products are currently hidden from the public.
//                   </p>
//                 </div>
//               </div>
//               <a
//                 href="mailto:support@marvelmarts.com"
//                 className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all"
//               >
//                 <Mail size={14} /> Contact Support
//               </a>
//             </div>
//           </div>
//         )}

//         <div className="flex-1">
//           {showRejectedView ? (
//             <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm">
//               <RejectedView reason={rejectionReason} email={session?.user?.email} />
//             </div>
//           ) : showReviewBanner ? (
//             <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
//               <div>
//                 <Clock className="mx-auto text-blue-500 mb-6" size={64} />
//                 <h2 className="text-2xl font-black text-accent-navy mb-4">Application Under Review</h2>
//                 <p className="text-gray-600 max-w-md mx-auto">
//                   We've received your documents. Our team will review them within 24-48 hours.
//                   You'll be notified once approved.
//                 </p>
//                 <button
//                   onClick={() => router.refresh()}
//                   className="mt-8 inline-block px-8 py-4 bg-brand-primary text-accent-navy rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-transform"
//                 >
//                   Check Status
//                </button>
//               </div>
//             </div>
//           ) : (
//             <div className="p-4 md:p-8 animate-in fade-in duration-500">
//               {children}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }





"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setVendorData } from "@/store/vendorSlice";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import MobileTopbar from "@/app/_components/MobileTopbar";
import { RejectedView } from "@/app/_components/RejectedView";
import SuspensionBanner from "@/app/_components/SuspensionBanner";
import {
  RefreshCw,
  LayoutDashboard,
  User,
  Package,
  Wallet,
  Truck,
  MessageSquare,
  Settings,
  ChartArea,
  CreditCard,
  Clock,
} from "lucide-react";

// ── Dashboard Menu Configuration ──
const DASHBOARD_CONFIG = {
  CUSTOMER: {
    Personal: [
      { label: "My Profile", href: "/account/customer", icon: <User size={16} /> },
      { label: "My Orders", href: "/account/customer/orders", icon: <Package size={16} /> },
    ],
    Support: [
      { label: "Messages", href: "/account/customer/messages", icon: <MessageSquare size={16} /> },
      { label: "Settings", href: "/account/customer/Profile-settings", icon: <Settings size={16} /> },
      { label: "Account Details", href: "/account/customer/Profile-settings", icon: <CreditCard size={16} /> },
      { label: "Payment Methods", href: "/account/customer/Profile-settings", icon: <CreditCard size={16} /> },
    ],
  },
  VENDOR: {
    Management: [
      { label: "Dashboard", href: "/account/vendor/", icon: <LayoutDashboard size={16} /> },
      { label: "My Products", href: "/account/vendor/products", icon: <Package size={16} /> },
      { label: "Settings", href: "/account/vendor/settings", icon: <Settings size={16} /> },
      { label: "Live Chat", href: "/account/vendor/messages", icon: <ChartArea size={16} /> },
    ],
    Finances: [
      { label: "Sales Orders", href: "/account/vendor/orders", icon: <Truck size={16} /> },
      { label: "Wallet & Payouts", href: "/account/vendor/payouts", icon: <Wallet size={16} /> },
      { label: "Buy Boost Credit", href: "/account/vendor/credit-boost", icon: <Wallet size={16} /> },
    ],
  },
};

export default function UnifiedAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: session, status: authStatus, update } = useSession();
  const initialSyncDone = useRef(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user) {
      dispatch(
        setVendorData({
          profile: session.user,
          onboarding: {
            profileDone: !!session.user.name,
            storeDone: !!session.user.vendorStatus,
            productDone: true,
            payoutsDone: true,
          },
          balance: Number(session.user.balance || 0),
        })
      );

      if (!initialSyncDone.current) {
        initialSyncDone.current = true;
        update().catch((err) => console.error("Session Update Failed:", err));
      }
    }
  }, [session?.user?.id, authStatus, dispatch, update]);

  const userRole = session?.user?.role;
  const isVendorZone = pathname.includes("/account/vendor");
  const activeZone: "VENDOR" | "CUSTOMER" = isVendorZone ? "VENDOR" : "CUSTOMER";

  const vendorStatus = session?.user?.vendorStatus ?? "NOT_STARTED";
  const isSuspended = session?.user?.isSuspended ?? false;
  const rejectionReason = session?.user?.rejectionReason ?? undefined;

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  const hasAllDocs = !!(
    session?.user?.identityDoc &&
    session?.user?.businessDoc &&
    session?.user?.locationDoc
  );

  const isNewOrIncompleteVendor =
    isVendorZone &&
    vendorStatus === "PENDING" &&
    !hasAllDocs;

  useEffect(() => {
    if (isNewOrIncompleteVendor) {
      router.replace("/account/vendor/verification");
    }
  }, [isNewOrIncompleteVendor, router]);

  const vendorLocked =
    isVendorZone &&
    !isAdmin &&
    (vendorStatus !== "APPROVED" || isSuspended);

  const showSuspendedBanner = isVendorZone && isSuspended;

  const showRejectedView =
    isVendorZone &&
    !isSuspended &&
    vendorStatus === "REJECTED";

  const showReviewBanner =
    isVendorZone &&
    !isSuspended &&
    (vendorStatus === "PENDING_REVIEW" || vendorStatus === "PENDING");

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

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {!showReviewBanner && !showRejectedView && (
        <aside className="hidden lg:flex w-61 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
          <DashboardSidebar
            role={activeZone}
            user={session?.user}
            sections={DASHBOARD_CONFIG[activeZone]}
            vendorLocked={vendorLocked}
            roles={"VENDOR"}
          />
        </aside>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        {!showReviewBanner && !showRejectedView && (
          <div className="block lg:hidden">
            <MobileTopbar
              role={activeZone}
              user={session?.user}
              sections={DASHBOARD_CONFIG[activeZone]}
              vendorLocked={vendorLocked}
              todayRevenue={isVendorZone ? Number(session?.user?.balance || 0) : 0}
              roles={"VENDOR"}
            />
          </div>
        )}

        {showSuspendedBanner && <SuspensionBanner isSuspended={isSuspended} />}

        <div className="flex-1">
          {showRejectedView ? (
            <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm">
              <RejectedView reason={rejectionReason} email={session?.user?.email} />
            </div>
          ) : showReviewBanner ? (
            <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
              <div>
                <Clock className="mx-auto text-blue-500 mb-6" size={64} />
                <h2 className="text-2xl font-black text-accent-navy mb-4">
                  Application Under Review
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  We've received your documents. Our team will review them within 24-48 hours.
                  You'll be notified once approved.
                </p>
                <button
                  onClick={() => router.refresh()}
                  className="mt-8 inline-block px-8 py-4 bg-brand-primary text-accent-navy rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-transform"
                >
                  Check Status
                </button>
              </div>
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