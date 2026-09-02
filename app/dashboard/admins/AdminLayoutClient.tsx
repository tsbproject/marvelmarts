"use client";

import { useMemo } from "react";

import DashboardSidebar from "@/app/_components/DashboardSidebar";

import DashboardHeader from "@/app/_components/DashboardHeader";

import AdminProviders from "@/app/_context/AdminProviders";

import MobileTopbar from "@/app/_components/MobileTopbar";

import {
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

// ─────────────────────────────────────
// ROLE TYPES
// ─────────────────────────────────────
export type UserRole =
  | "CUSTOMER"
  | "VENDOR"
  | "ADMIN"
  | "SUPER_ADMIN";

// ─────────────────────────────────────
// PROPS
// ─────────────────────────────────────
interface AdminLayoutClientProps {
  user: any;

  children: React.ReactNode;

  todayRevenue?: number;
}

// ─────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────
export default function AdminLayoutClient({
  user,
  children,
  todayRevenue = 0,
}: AdminLayoutClientProps) {

  // ─────────────────────────────────────
  // ROLE CHECKS
  // ─────────────────────────────────────
  const isSuperAdmin =
    user?.role ===
    "SUPER_ADMIN";

  const isAdmin =
    user?.role ===
      "ADMIN" ||
    isSuperAdmin;

  const currentRole: UserRole =
    isSuperAdmin
      ? "SUPER_ADMIN"
      : "ADMIN";

  // ─────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────
  const permissions =
  user?.admin ??
  user?.permissions ??
  {};

  const hasPerm = (
    perm: string
  ) => {

    if (isSuperAdmin)
      return true;

    return !!permissions?.[perm];
  };



  // ─────────────────────────────────────
  // SIDEBAR SECTIONS
  // ─────────────────────────────────────
  const sections = useMemo(() => {
  const general = [
    {
      label: "Overview",
      href: "/dashboard/admins/overview",
      visible: true,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* ADMINISTRATION                                                     */
  /* ------------------------------------------------------------------ */

  const administration = [
    {
      label: "Admins",
      href: "/dashboard/admins",
      visible:
        isSuperAdmin ||
        !!permissions.manageAdmins,
    },

    {
      label: "Users",
      href: "/dashboard/admins/users",
      visible:
        isSuperAdmin ||
        !!permissions.manageUsers,
    },

    {
      label: "Activity",
      href: "/dashboard/admins/activity",
      visible:
        isSuperAdmin ||
        !!permissions.manageActivity,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* MARKETPLACE                                                        */
  /* ------------------------------------------------------------------ */

  const marketplace = [
    {
      label: "Products",
      href: "/dashboard/admins/products",
      visible:
        isSuperAdmin ||
        !!permissions.manageProducts,
    },

    {
      label: "Orders",
      href: "/dashboard/admins/orders",
      visible:
        isSuperAdmin ||
        !!permissions.manageOrders,
    },

    {
      label: "Categories",
      href: "/dashboard/admins/categories",
      visible:
        isSuperAdmin ||
        !!permissions.manageCategories,
    },

    {
      label: "Reviews",
      href: "/dashboard/admins/reviews",
      visible:
        isSuperAdmin ||
        !!permissions.manageReviews,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* VENDOR OPERATIONS                                                  */
  /* ------------------------------------------------------------------ */

  const vendors = [
    {
      label: "Vendors",
      href: "/dashboard/admins/vendors",
      visible:
        isSuperAdmin ||
        !!permissions.manageVendors,
    },

    {
      label: "Verifications",
      href: "/dashboard/admins/verifications",
      visible:
        isSuperAdmin ||
        !!permissions.manageVerifications,
    },

    {
      label: "Vendor Payouts",
      href: "/dashboard/admins/vendorspayout",
      visible:
        isSuperAdmin ||
        !!permissions.manageVendorspayout,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* CONTENT & GROWTH                                                   */
  /* ------------------------------------------------------------------ */

  const content = [
    {
      label: "Blogs",
      href: "/dashboard/blogs",
      visible:
        isSuperAdmin ||
        !!permissions.manageBlogs,
    },

    {
      label: "Trending",
      href: "/dashboard/admins/trending",
      visible:
        isSuperAdmin ||
        !!permissions.manageTrending,
    },

    {
      label: "Subscribers",
      href: "/dashboard/admins/subscribers",
      visible:
        isSuperAdmin ||
        !!permissions.manageSubscribers,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* SUPPORT                                                            */
  /* ------------------------------------------------------------------ */

  const support = [
    {
      label: "Support",
      href: "/dashboard/admins/support",

      icon: (
        <LifeBuoy size={20} />
      ),

      visible:
        hasPerm("manageSupport"),

      hasChildren: true,

      children: [
        {
          label: "Articles",
          href: "/dashboard/admins/support/articles",
          icon: (
            <LifeBuoy size={16} />
          ),
        },

        {
          label: "Tickets",
          href: "/dashboard/admins/support/tickets",
          icon: (
            <LifeBuoy size={16} />
          ),
        },

        {
          label: "Refunds",
          href: "/dashboard/admins/support/refunds",
          icon: (
            <LifeBuoy size={16} />
          ),
        },

        {
          label: "Live Chat",
          href: "/dashboard/admins/support/messages",
          icon: (
            <MessageCircle size={16} />
          ),
        },
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
/* SYSTEM                                                             */
/* ------------------------------------------------------------------ */

    const system = [
      {
        label: "Security",
        href: "/dashboard/admins/security",
        icon: (
          <ShieldCheck size={20} />
        ),
        visible: isSuperAdmin,
      },

      {
        label: "Settings",
        href: "/dashboard/admins/settings",
        visible:
          isSuperAdmin ||
          !!permissions.manageSettings,
      },
    ];

  return {
    general:
      general.filter(
        (item) => item.visible
      ),

    administration:
      administration.filter(
        (item) => item.visible
      ),

    marketplace:
      marketplace.filter(
        (item) => item.visible
      ),

    vendors:
      vendors.filter(
        (item) => item.visible
      ),

    content:
      content.filter(
        (item) => item.visible
      ),

    support:
      support.filter(
        (item) => item.visible
      ),

    system:
      system.filter(
        (item) => item.visible
      ),
  };
}, [
  isSuperAdmin,
  permissions,
]);







  // ─────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────
  return (
    <AdminProviders>

      <div className="flex min-h-screen bg-gray-50">

        {/* SIDEBAR */}
        <div className="hidden lg:block">

          <DashboardSidebar
            sections={sections}
            role={currentRole}
            user={user}
            permissions={permissions}
          />

        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* MOBILE */}
          <div className="lg:hidden">

            <MobileTopbar
              role={currentRole}
              sections={sections}
              isSuperAdmin={isSuperAdmin}
              todayRevenue={todayRevenue}
              user={user}
              permissions={permissions} roles={"CUSTOMER"}            />

          </div>

          {/* CONTENT */}
          <main className="flex-1 flex flex-col">

            <div
              className="
                w-full
                px-4 lg:px-8
                py-6
                flex flex-col
                gap-6
              "
            >

              {/* TOP HEADER */}
              <div
                className="
                  hidden lg:flex
                  justify-between
                  items-center
                  gap-3
                  border-b
                  border-gray-200
                  pb-4
                "
              >

                <h2
                  className="
                    text-2xl
                    font-black
                    text-accent-navy
                    uppercase
                    tracking-tight
                    italic
                  "
                >
                  Admin Command

                  <span className="text-brand-primary">
                    .
                  </span>

                </h2>

                <span
                  className="
                    text-sm
                    font-bold
                    text-gray-700
                    bg-white
                    px-4 py-2
                    rounded-xl
                    shadow-sm
                    border
                    border-gray-100
                  "
                >

                  {user?.name}

                  <span className="text-brand-primary mx-1">
                    |
                  </span>

                  {isSuperAdmin
                    ? "SUPER ADMIN"
                    : "ADMIN"}

                </span>

              </div>

              {/* DASHBOARD HEADER */}
              <DashboardHeader
                title="Administrators"
                showLogout={true}
                actions={
                  isSuperAdmin
                    ? [
                        {
                          label:
                            "Add Admin",

                          link:
                            "/dashboard/admins/create",

                          style:
                            "bg-blue-600 hover:bg-blue-700 w-full sm:w-40 text-center text-white py-3 rounded-xl font-bold transition-all",
                        },

                        {
                          label:
                            "Add Category",

                          link:
                            "/dashboard/admins/categories/create",

                          style:
                            "bg-green-600 hover:bg-green-700 w-full sm:w-48 text-center text-white py-3 rounded-xl font-bold transition-all",
                        },
                      ]
                    : []
                }
              />

              {/* PAGE CONTENT */}
              <div
                className="
                  w-full
                  animate-in
                  fade-in
                  slide-in-from-bottom-2
                  duration-500
                "
              >

                {children}

              </div>

            </div>

          </main>

        </div>

      </div>

    </AdminProviders>
  );
}
