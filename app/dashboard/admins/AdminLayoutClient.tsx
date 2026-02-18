"use client";

import { useMemo } from "react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminProviders from "@/app/_context/AdminProviders";
import MobileTopbar from "@/app/_components/MobileTopbar";

interface AdminLayoutClientProps {
  user: any;
  children: React.ReactNode;
  todayRevenue?: number;
}

export default function AdminLayoutClient({ user, children, todayRevenue = 0 }: AdminLayoutClientProps) {
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const permissions = user.permissions ?? {};

  const sections = useMemo(() => {
    const general = [{ label: "Overview", href: "/dashboard", visible: true }];
    
    const management = [
      { label: "Activity", href: "/dashboard/admins/activity", visible: isSuperAdmin || permissions.manageActivity },
      { label: "Review", href: "/dashboard/admins/review", visible: isSuperAdmin || permissions.manageReviews },
      { label: "Admins", href: "/dashboard/admins", visible: isSuperAdmin || permissions.manageAdmins },
      { label: "Users", href: "/dashboard/admins/users", visible: isSuperAdmin || permissions.manageUsers },
      { label: "Blogs", href: "/dashboard/blogs", visible: isSuperAdmin || permissions.manageBlogs },
      { label: "Products", href: "/dashboard/admins/products", visible: isSuperAdmin || permissions.manageProducts },
      { label: "Trending", href: "/dashboard/admins/trending", visible: isSuperAdmin || permissions.manageTrending },
      { label: "Orders", href: "/dashboard/admins/orders", visible: isSuperAdmin || permissions.manageOrders },
      { label: "Categories", href: "/dashboard/admins/categories", visible: isSuperAdmin || permissions.manageCategories },
      { label: "Settings", href: "/dashboard/admins/settings", visible: isSuperAdmin || permissions.manageSettings },
      { label: "Subscribers", href: "/dashboard/admins/Subscribers", visible: isSuperAdmin || permissions.manageSubscribers },
      { label: "Support", href: "/dashboard/admins/support", visible: isSuperAdmin || permissions.manageSupport },
      { label: "Vendors", href: "/dashboard/admins/vendors", visible: isSuperAdmin || permissions.manageVendors },
      { label: "Verifications", href: "/dashboard/admins/verifications", visible: isSuperAdmin || permissions.manageVerifications },
    ];

    const permissionsMenu = Object.entries(permissions)
      .filter(([_, value]) => value === true)
      .map(([key]) => ({
        label: key.replace(/([A-Z])/g, " $1").trim(),
        href: "#",
        visible: true,
      }));

    return {
      general: general.filter((i) => i.visible),
      management: management.filter((i) => i.visible),
      permissionsMenu,
    };
  }, [isSuperAdmin, permissions]);

  return (
    <AdminProviders>
      <div className="flex min-h-screen bg-gray-50">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <div className="hidden lg:block">
          <DashboardSidebar 
            sections={sections} 
            role={user.role} 
            user={user}
          />
        </div>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* MOBILE TOPBAR */}
          <div className="lg:hidden">
            <MobileTopbar 
              role={user.role} 
              sections={sections} 
              isSuperAdmin={isSuperAdmin} 
              todayRevenue={todayRevenue} 
              user={user}
            />
          </div>

          {/* PAGE CONTENT */}
          <main className="flex-1 flex flex-col">
            <div className="w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
              
              {/* Desktop Only Branding Header */}
              <div className="hidden lg:flex justify-between items-center gap-3 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight italic">
                  Admin Command<span className="text-brand-primary">.</span>
                </h2>
                <span className="text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  {user.name} <span className="text-brand-primary mx-1">|</span> {user.role}
                </span>
              </div>

              {/* Functional Dashboard Header */}
              <DashboardHeader
                title="Administrators"
                showLogout={true}
                actions={
                  isSuperAdmin
                    ? [
                        {
                          label: "Add Admin",
                          link: "/dashboard/admins/create",
                          style: "bg-blue-600 hover:bg-blue-700 w-full sm:w-40 text-center text-white py-3 rounded-xl font-bold transition-all",
                        },
                        {
                          label: "Add Category",
                          link: "/dashboard/admins/categories/create",
                          style: "bg-green-600 hover:bg-green-700 w-full sm:w-48 text-center text-white py-3 rounded-xl font-bold transition-all",
                        },
                      ]
                    : []
                }
              />

              {/* Dynamic Child Content */}
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
