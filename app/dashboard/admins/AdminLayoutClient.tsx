"use client";

import { useMemo } from "react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminProviders from "@/app/_context/AdminProviders";
import MobileTopbar from "@/app/_components/MobileTopbar";

interface AdminLayoutClientProps {
  user: any;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const permissions = user.permissions ?? {};

  const sections = useMemo(() => {
    const general = [{ label: "Overview", href: "/dashboard", visible: true }];
    const management = [
      { label: "Admins", href: "/dashboard/admins", visible: isSuperAdmin || permissions.manageAdmins },
      { label: "Users", href: "/dashboard/admins/users", visible: isSuperAdmin || permissions.manageUsers },
      { label: "Blogs", href: "/dashboard/blogs", visible: isSuperAdmin || permissions.manageBlogs },
      { label: "Products", href: "/dashboard/admins/products", visible: isSuperAdmin || permissions.manageProducts },
      { label: "Orders", href: "/dashboard/admins/orders", visible: isSuperAdmin || permissions.manageOrders },
      { label: "Categories", href: "/dashboard/admins/categories", visible: isSuperAdmin || permissions.manageCategories },
      { label: "Settings", href: "/dashboard/admins/settings", visible: isSuperAdmin || permissions.manageSettings },
    ];
    const permissionsMenu = Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => ({
        label: key.replace(/([A-Z])/g, " $1"),
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
        {/* ================= DESKTOP ================= */}
        <div className="hidden lg:block flex-1">
          <DashboardSidebar sections={sections}>
            <div className="w-full px-6 py-6 flex flex-col gap-6">
              {/* Global header */}
              <div className="flex justify-between items-center gap-3">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <span className="text-base text-gray-700 truncate">
                  {user.name} ({user.role})
                </span>
              </div>

              {/* Page-specific header (logout shown here) */}
              <DashboardHeader
                title="Administrators"
                showLogout={true}   //show logout on desktop
                actions={
                  isSuperAdmin
                    ? [
                        {
                          label: "Add Admin",
                          link: "/dashboard/admins/create",
                          style: "bg-blue-600 hover:bg-blue-700 w-32 text-center",
                        },
                        {
                          label: "Add Category",
                          link: "/dashboard/admins/categories/create",
                          style: "bg-green-600 hover:bg-green-700 w-36 text-center",
                        },
                      ]
                    : []
                }
              />

              {/* Page content */}
              <div className="w-full">{children}</div>
            </div>
          </DashboardSidebar>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="lg:hidden flex flex-col w-full">
          {/*MobileTopbar handles mobile logout + menu */}
          <MobileTopbar role={user.role} sections={sections} isSuperAdmin={isSuperAdmin} />

          {/* Page-specific header (logout hidden on mobile) */}
          <div className="px-4 py-4">
            <DashboardHeader
              title="Administrators"
              showLogout={false}   //hide logout on mobile
              actions={
                isSuperAdmin
                  ? [
                      {
                        label: "Add Admin",
                        link: "/dashboard/admins/create",
                        style: "bg-blue-600 hover:bg-blue-700 w-full py-5 sm:w-32 text-center",
                      },
                      {
                        label: "Add Category",
                        link: "/dashboard/admins/categories/create",
                        style: "bg-green-600 hover:bg-green-700 w-full py-5 sm:w-36 text-center",
                      },
                    ]
                  : []
              }
            />
          </div>

          {/* Page content */}
          <main className="flex-1 px-4 pb-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}

