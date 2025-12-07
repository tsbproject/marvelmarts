"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo } from "react";
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Define sections and links
  const sections = useMemo(() => {
    const general = [
      {
        label: "Overview",
        href: "/dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        visible: true,
      },
    ];

    const management = [

         {
        label: "Admins",
        href: "/dashboard/admins",
        icon: <ShieldCheckIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageAdmins,
      },
      {
        label: "Users",
        href: "/dashboard/users",
        icon: <UsersIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageUsers,
      },
      {
        label: "Blogs",
        href: "/dashboard/blogs",
        icon: <NewspaperIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageBlogs,
      },
   
      {
        label: "Products",
        href: "/dashboard/products",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageProducts,
      },
      {
        label: "Orders",
        href: "/dashboard/orders",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageOrders,
      },
    ];

    // Filter links based on visibility
    return {
      general: general.filter((item) => item.visible),
      management: management.filter((item) => item.visible),
    };
  }, [isSuperAdmin, permissions]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-75 bg-brand-primary border-r shadow-sm flex flex-col">
        {/* Branding */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">MarvelMarts</h2>
          <p className="text-xl text-gray-50">Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {sections.general.length > 0 && (
            <div>
              <p className="text-xl font-semibold text-gray-50 uppercase mb-2">
                General
              </p>
              <ul className="space-y-3">
                {sections.general.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center text-2xl gap-2 px-3 py-2 rounded-lg text-gray-950 hover:bg-gray-100 hover:text-black transition"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sections.management.length > 0 && (
            <div>
              <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">
                Management
              </p>
              <ul className="space-y-2">
                {sections.management.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-black text-2xl hover:bg-gray-50 hover:text-black transition"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t text-sm text-gray-500">
          Signed in as{" "}
          <span className="font-medium">{session?.user?.email ?? "Unknown"}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

