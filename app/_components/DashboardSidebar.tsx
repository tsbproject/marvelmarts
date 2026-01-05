



"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import SignOutButton from "./SignOutButton";
import { Sections } from "@/types/dashboard"; // <-- shared type

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: Sections = useMemo(() => {
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
        href: "/dashboard/admins/users",
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
        href: "/dashboard/admins/products",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageProducts,
      },
      {
        label: "Orders",
        href: "/dashboard/admins/orders",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageOrders,
      },
      {
        label: "Categories",
        href: "/dashboard/admins/categories",
        icon: <Squares2X2Icon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageCategories,
      },
      {
        label: "Settings",
        href: "/dashboard/admins/settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageSettings,
      },
    ];

    const permissionsMenu = Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => ({
        label: key.replace(/([A-Z])/g, " $1"),
        href: "#",
        icon: <ShieldCheckIcon className="w-5 h-5" />,
      }));

    return {
      general: general.filter((item) => item.visible),
      management: management.filter((item) => item.visible),
      permissionsMenu,
    };
  }, [isSuperAdmin, permissions]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-brand-primary border-r shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">MarvelMarts</h2>
          <p className="text-xl text-gray-50">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6">
          {sections.general.length > 0 && (
            <div>
              <p className="text-xl font-semibold text-gray-50 uppercase mb-2">General</p>
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

          {sections.management && sections.management.length > 0 && (
            <div>
              <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">Management</p>
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

          {!isSuperAdmin && sections.permissionsMenu && sections.permissionsMenu.length > 0 && (
            <div>
              <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">My Permissions</p>
              <ul className="space-y-2">
                {sections.permissionsMenu.map((link) => (
                  <li key={link.label}>
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 text-xl">
                      {link.icon}
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer with sign-out */}
        <div className="px-4 py-4 border-t text-sm text-gray-50 flex flex-col gap-2">
          <span>
            Signed in as{" "}
            <span className="font-medium">{session?.user?.email ?? "Unknown"}</span>
          </span>
          <SignOutButton
            redirectPath="/auth/sign-in"
            label="Sign Out"
            className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          />
        </div>
      </aside>

      {/* ================= MOBILE TOPBAR ================= */}
      <header className="lg:hidden w-full bg-brand-primary text-white flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-lg font-bold">MarvelMarts</h2>
          <p className="text-sm">Dashboard</p>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </header>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      {mobileOpen && (
        <nav className="lg:hidden bg-gray-700 text-white px-4 py-2 space-y-2">
          {sections.general.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block hover:bg-gray-600 rounded px-3 py-2"
            >
              {link.label}
            </Link>
          ))}
          {sections.management?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block hover:bg-gray-600 rounded px-3 py-2"
            >
              {link.label}
            </Link>
          ))}
          {!isSuperAdmin &&
            sections.permissionsMenu?.map((link) => (
              <span key={link.label} className="block px-3 py-2 text-gray-300">
                {link.label}
              </span>
            ))}
          <SignOutButton
            redirectPath="/auth/sign-in"
            label="Sign Out"
            className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          />
        </nav>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
