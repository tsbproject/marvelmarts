// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useDispatch } from "react-redux";
// import { setVendorData } from "@/store/vendorSlice";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import MobileTopbar from "@/app/_components/MobileTopbar";
// import { fetchVendorProfile } from "@/store/vendorSlice";
// import { RejectedView } from "@/app/_components/RejectedView";
// import SuspensionBanner from "@/app/_components/SuspensionBanner";
// import {
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
// } from "lucide-react";
// import { UserRole } from "@prisma/client";

// // ── Dashboard Menu Configuration ──
// const DASHBOARD_CONFIG = {
//   CUSTOMER: {
//     Personal: [
//       { label: "My Profile", href: "/account/customer", icon: <User size={16} /> },
//       { label: "My Orders", href: "/account/customer/orders", icon: <Package size={16} /> },
//     ],
//     Support: [
//       // { label: "Messages", href: "/account/customer/messages", icon: <MessageSquare size={16} /> },
//       { label: "Settings", href: "/account/customer/profile-settings", icon: <Settings size={16} /> },
//       { label: "Bank Details", href: "/account/customer/bank-details", icon: <CreditCard size={16} /> },
//       { label: "Payment Methods", href: "/account/customer/payment-methods", icon: <CreditCard size={16} /> },
//     ],
//   },
//   VENDOR: {
//     Management: [
//       { label: "Dashboard", href: "/account/vendor/", icon: <LayoutDashboard size={16} /> },
//       { label: "My Products", href: "/account/vendor/products", icon: <Package size={16} /> },
//       { label: "Settings", href: "/account/vendor/store-settings", icon: <Settings size={16} /> },
//       { label: "Live Chat", href: "/account/vendor/messages", icon: <ChartArea size={16} /> },
//     ],
//     Finances: [
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


      
//                      useEffect(() => {
//                         setIsSidebarOpen(false);
//                       }, [pathname]);

                      
//                       useEffect(() => {
//                         if (authStatus === "authenticated" && session?.user) {
//                           dispatch(
//                             setVendorData({
//                               profile: session.user,
//                               onboarding: {
//                                 profileDone: false,
//                                 storeDone: false,
//                                 productDone: false,
//                                 payoutsDone: false,
//                               },
//                               balance: 0
//                             })
//                           );

                        
//                         }
//                       }, [authStatus, session?.user, dispatch]);


      

//           const userRole = session?.user?.role;

//       useEffect(() => {
//         if (authStatus === "authenticated" && session?.user && userRole === "VENDOR") {
//           dispatch(fetchVendorProfile() as any);
//         }
//       }, [authStatus, session?.user?.id, userRole, dispatch]);





//   const isVendorZone = pathname.includes("/account/vendor");
//   const activeZone: "VENDOR" | "CUSTOMER" = isVendorZone ? "VENDOR" : "CUSTOMER";

//   const vendorStatus = session?.user?.vendorStatus ?? "NOT_STARTED";
//   const isSuspended = session?.user?.isSuspended ?? false;
//   const rejectionReason = session?.user?.rejectionReason ?? undefined;

//   const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";


 

// const hasAllDocs = !!(
//   session?.user?.identityDoc &&
//   session?.user?.businessDoc &&
//   session?.user?.locationDoc
// );

// const isNewOrIncompleteVendor =
//   isVendorZone &&
//   vendorStatus === "AWAITING_DOCUMENTS" &&
//   !hasAllDocs;

// useEffect(() => {
//   if (isNewOrIncompleteVendor) {
//     router.replace("/account/vendor/verification");
//   }
// }, [isNewOrIncompleteVendor, router]);

// const vendorLocked =
//   isVendorZone &&
//   !isAdmin &&
//   (vendorStatus !== "APPROVED" || isSuspended);

// const showSuspendedBanner = isVendorZone && isSuspended;

// const isVerificationPage = pathname === "/account/vendor/verification";

// const showRejectedView =
//   isVendorZone &&
//   !isSuspended &&
//   vendorStatus === "REJECTED" &&
//   !isVerificationPage;

// const showReviewBanner =
//   isVendorZone &&
//   !isSuspended &&
//   vendorStatus === "PENDING_REVIEW";

  

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
//       {!showReviewBanner && !showRejectedView && (
//         <aside className="hidden lg:flex w-61 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
//           <DashboardSidebar
//             role={activeZone}
//             user={session?.user}
//             sections={DASHBOARD_CONFIG[activeZone]}
//             vendorLocked={vendorLocked}
//             roles={"VENDOR"}
//           />
//         </aside>
//       )}

//       <main className="flex-1 min-w-0 flex flex-col">
//         {!showReviewBanner && !showRejectedView && (
//           <div className="block lg:hidden">
//             <MobileTopbar
//               role={activeZone}
//               user={session?.user}
//               sections={DASHBOARD_CONFIG[activeZone]}
//               vendorLocked={vendorLocked}
//               todayRevenue={isVendorZone ? Number(session?.user?.balance || 0) : 0}
//               roles={"VENDOR"}
//             />
//           </div>
//         )}

//         {showSuspendedBanner && <SuspensionBanner isSuspended={isSuspended} />}

//         <div className="flex-1">
//           {showRejectedView ? (
//             <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm">
//               <RejectedView reason={rejectionReason} email={session?.user?.email} />
//             </div>
//           ) : showReviewBanner ? (
//             <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
//               <div>
//                 <Clock className="mx-auto text-blue-500 mb-6" size={64} />
//                 <h2 className="text-2xl font-black text-accent-navy mb-4">
//                   Application Under Review
//                 </h2>
//                 <p className="text-gray-600 max-w-md mx-auto">
//                   We've received your documents. Our team will review them within 24-48 hours.
//                   You'll be notified once approved.
//                 </p>
//                 <button
//                   onClick={() => router.refresh()}
//                   className="mt-8 inline-block px-8 py-4 bg-brand-primary text-accent-navy rounded-xl text-sm font-black uppercase shadow-lg hover:scale-105 transition-transform"
//                 >
//                   Check Status
//                 </button>
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

import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "@/app/_context/NotificationContext";
import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import NextTopLoader from "nextjs-toploader";
import { setUser, clearUser } from "@/store/authSlice";
import { setWishlist } from "@/store/wishlistSlice";
import { hydrateCart } from "@/store/cartSlice";
import { Loader2 } from "lucide-react";

function ReduxStateSync({ onReady }: { onReady: () => void }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("marvel_cart");
      if (savedCart) {
        try {
          dispatch(hydrateCart(JSON.parse(savedCart)));
        } catch {
          localStorage.removeItem("marvel_cart");
        }
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      dispatch(setUser({
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role,
        permissions: (session.user as any).permissions || {},
        isSuspended: (session.user as any).isSuspended ?? false,
      } as any));

      const fetchUserWishlist = async () => {
        try {
          const res = await fetch("/api/wishlist/get");
          if (res.ok) {
            dispatch(setWishlist(await res.json()));
          }
        } catch (error) {
          console.error("Error hydrating wishlist:", error);
        } finally {
          onReady();
        }
      };

      fetchUserWishlist();
      return;
    }

    dispatch(clearUser());
    dispatch(setWishlist([]));
    onReady();
  }, [session, status, dispatch, onReady]);

  return null;
}

export default function ClientLayout({
  children,
  initialCategories,
  session,
}: {
  children: React.ReactNode;
  initialCategories: any[];
  session?: any;
}) {
  const [authReady, setAuthReady] = useState(false);

  return (
    <Provider store={store}>
      <NextAuthSessionProvider session={session}>
        <ReduxStateSync onReady={() => setAuthReady(true)} />

        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              <NextTopLoader
                color="#002B5B"
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                easing="ease"
                speed={200}
              />

              <Header initialCategories={initialCategories} />

              <main className="min-h-screen">
                {authReady ? (
                  children
                ) : (
                  <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  </div>
                )}
              </main>

              <Footer />
            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}