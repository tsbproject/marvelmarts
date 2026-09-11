"use client";

export const dynamic = "force-dynamic";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";

import {
  setVendorData,
  fetchVendorProfile,
} from "@/store/vendorSlice";

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
  Settings,
  ChartArea,
  CreditCard,
  Clock,
  BarChart3,
} from "lucide-react";

// ── Dashboard Menu Configuration ──
// ─────────────────────────────────────
// DASHBOARD MENU CONFIGURATION
// ─────────────────────────────────────

const DASHBOARD_CONFIG = {
  CUSTOMER: {
    general: [
      {
        label: "My Profile",
        href: "/account/customer",
        icon: <User size={16} />,
        visible: true,
      },
      {
        label: "My Orders",
        href: "/account/customer/orders",
        icon: <Package size={16} />,
        visible: true,
      },
    ],

    management: [
      {
        label: "Settings",
        href: "/account/customer/profile-settings",
        icon: <Settings size={16} />,
        visible: true,
      },
      {
        label: "Bank Details",
        href: "/account/customer/bank-details",
        icon: <CreditCard size={16} />,
        visible: true,
      },
      {
        label: "Payment Methods",
        href: "/account/customer/payment-methods",
        icon: <CreditCard size={16} />,
        visible: true,
      },
    ],
  },

  VENDOR: {
    general: [
      {
        label: "Dashboard",
        href: "/account/vendor",
        icon: <LayoutDashboard size={16} />,
        visible: true,
      },
      {
        label: "My Products",
        href: "/account/vendor/products",
        icon: <Package size={16} />,
        visible: true,
      },
      {
        label: "Live Chat",
        href: "/account/vendor/messages",
        icon: <ChartArea size={16} />,
        visible: true,
      },
      {
        label: "Analytics",
        href: "/account/vendor/analytics",
        icon: <BarChart3 size={16} />,
        visible: true,
      },
    ],

    management: [
      {
        label: "Sales Orders",
        href: "/account/vendor/orders",
        icon: <Truck size={16} />,
        visible: true,
      },
      {
        label: "Wallet & Payouts",
        href: "/account/vendor/payouts",
        icon: <Wallet size={16} />,
        visible: true,
      },
      {
        label: "Buy Boost Credit",
        href: "/account/vendor/credit-boost",
        icon: <Wallet size={16} />,
        visible: true,
      },
      {
        label: "Settings",
        href: "/account/vendor/store-settings",
        icon: <Settings size={16} />,
        visible: true,
      },
    ],
  },
};

export default function UnifiedAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: session,
    status: authStatus,
  } = useSession();

  const userRole = session?.user?.role;

  /* ---------------------------------------------------------------------- */
  /* REDUX SESSION SYNC                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      session?.user
    ) {
      dispatch(
        setVendorData({
          profile: session.user,

          onboarding: {
            profileDone: false,
            storeDone: false,
            productDone: false,
            payoutsDone: false,
          },

          balance: 0,
        })
      );
    }
  }, [
    authStatus,
    session?.user,
    dispatch,
  ]);

  /* ---------------------------------------------------------------------- */
  /* VENDOR PROFILE SYNC                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      session?.user?.id &&
      userRole === "VENDOR"
    ) {
      dispatch(
        fetchVendorProfile() as any
      );
    }
  }, [
    authStatus,
    session?.user?.id,
    userRole,
    dispatch,
  ]);

  /* ---------------------------------------------------------------------- */
  /* AUTH REDIRECT                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      authStatus ===
      "unauthenticated"
    ) {
      router.replace(
        `/auth/sign-in?callbackUrl=${encodeURIComponent(
          pathname
        )}`
      );
    }
  }, [
    authStatus,
    pathname,
    router,
  ]);

  /* ---------------------------------------------------------------------- */
  /* ACCOUNT ZONE                                                           */
  /* ---------------------------------------------------------------------- */

  const isVendorZone =
    pathname.startsWith(
      "/account/vendor"
    );

  const activeZone:
    | "VENDOR"
    | "CUSTOMER" =
    isVendorZone
      ? "VENDOR"
      : "CUSTOMER";

  /* ---------------------------------------------------------------------- */
  /* VENDOR STATE                                                           */
  /* ---------------------------------------------------------------------- */

  const vendorStatus =
    session?.user?.vendorStatus ??
    "NOT_STARTED";

  const isSuspended =
    session?.user?.isSuspended ??
    false;

  const rejectionReason =
    session?.user
      ?.rejectionReason ??
    undefined;

  const isVerificationPage =
    pathname ===
    "/account/vendor/verification";

  /* ---------------------------------------------------------------------- */
  /* VERIFICATION REDIRECT                                                  */
  /* ---------------------------------------------------------------------- */

  const isNewOrIncompleteVendor =
    isVendorZone &&
    vendorStatus ===
      "AWAITING_DOCUMENTS" &&
    !isVerificationPage;

  useEffect(() => {
    if (
      isNewOrIncompleteVendor
    ) {
      router.replace(
        "/account/vendor/verification"
      );
    }
  }, [
    isNewOrIncompleteVendor,
    router,
  ]);

  /* ---------------------------------------------------------------------- */
  /* VENDOR NAVIGATION LOCK                                                 */
  /* ---------------------------------------------------------------------- */

  const vendorLocked =
    isVendorZone &&
    (
      vendorStatus !==
        "APPROVED" ||
      isSuspended
    );

  /* ---------------------------------------------------------------------- */
  /* VENDOR STATUS VIEWS                                                    */
  /* ---------------------------------------------------------------------- */

  const showSuspendedBanner =
    isVendorZone &&
    isSuspended;

  const showRejectedView =
    isVendorZone &&
    !isSuspended &&
    vendorStatus ===
      "REJECTED" &&
    !isVerificationPage;

  const showReviewBanner =
    isVendorZone &&
    !isSuspended &&
    vendorStatus ===
      "PENDING_REVIEW";

  /* ---------------------------------------------------------------------- */
  /* AUTH LOADING                                                           */
  /* ---------------------------------------------------------------------- */

  if (
    authStatus === "loading"
  ) {
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

  if (
    authStatus ===
    "unauthenticated"
  ) {
    return null;
  }


  

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">

      {!showReviewBanner &&
        !showRejectedView && (
          <aside className="hidden lg:flex w-61 h-screen sticky top-0 border-r border-gray-100 bg-gray-950">
            <DashboardSidebar
              role={activeZone}
              user={session?.user}
              sections={
                DASHBOARD_CONFIG[
                  activeZone
                ]
              }
              vendorLocked={
                vendorLocked
              }
            />
          </aside>
        )}

      <main className="flex-1 min-w-0 flex flex-col">

        {!showReviewBanner &&
          !showRejectedView && (
            <div className="block lg:hidden">
              <MobileTopbar
                role={activeZone}
                user={session?.user}
                sections={
                  DASHBOARD_CONFIG[
                    activeZone
                  ]
                }
                vendorLocked={
                  vendorLocked
                }
                todayRevenue={
                  isVendorZone
                    ? Number(
                        session
                          ?.user
                          ?.balance ||
                          0
                      )
                    : 0
                }
                roles="VENDOR"
              />
            </div>
          )}

        {showSuspendedBanner && (
          <SuspensionBanner
            isSuspended={
              isSuspended
            }
          />
        )}

        <div className="flex-1">

          {showRejectedView ? (
            <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm">
              <RejectedView
                reason={
                  rejectionReason
                }
                email={
                  session?.user
                    ?.email
                }
              />
            </div>
          ) : showReviewBanner ? (
            <div className="min-h-[80vh] flex items-center justify-center bg-white m-4 rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
              <div>
                <Clock
                  className="mx-auto text-blue-500 mb-6"
                  size={64}
                />

                <h2 className="text-2xl font-black text-accent-navy mb-4">
                  Application Under
                  Review
                </h2>

                <p className="text-gray-600 max-w-md mx-auto">
                  We've received your
                  documents. Our team
                  will review them
                  within 24-48 hours.
                  You'll be notified
                  once approved.
                </p>

                <button
                  onClick={() =>
                    router.refresh()
                  }
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
