"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardSidebarClient from "./DashboardSidebarClient";
import DashboardHeaderClient from "./DashboardHeaderClient";
import SignOutButton from "@/app/_components/SignOutButton";
import AdminProviders from "@/app/_context/AdminProviders";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, easeInOut } from "framer-motion";

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

  const [mobileOpen, setMobileOpen] = useState(false);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: easeInOut,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <AdminProviders>
      <div className="flex min-h-screen bg-gray-50">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <div className="hidden lg:block flex-1">
            <DashboardSidebarClient sections={sections}>
              <div className="w-full px-6 py-6 flex flex-col gap-6">
                {/* Global header */}
                <div className="flex justify-between items-center gap-3">
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-gray-700 truncate">
                      {user.name} ({user.role})
                    </span>
                    {/* <SignOutButton
                      redirectPath="/auth/sign-in"
                      label="Sign Out"
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-base"
                    /> */}
                  </div>
                </div>

        {/* Page-specific header */}
        <DashboardHeaderClient
      title="Administrators"
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
</DashboardSidebarClient>

        </div>

        {/* ================= MOBILE TOPBAR ================= */}
        <div className="lg:hidden flex flex-col w-full">
          <header className="bg-brand-primary text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">MarvelMarts</h2>
              <p className="text-sm">Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <SignOutButton
                redirectPath="/auth/sign-in"
                label="Sign Out"
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              />
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
                {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </header>

          {/* Mobile dropdown menu with staggered animation */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="bg-gray-700 text-white px-4 py-3 space-y-2"
              >
                {sections.general.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block hover:bg-gray-600 rounded px-3 py-2"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {sections.management.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block hover:bg-gray-600 rounded px-3 py-2"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {!isSuperAdmin &&
                  sections.permissionsMenu.map((link) => (
                    <motion.div key={link.label} variants={itemVariants}>
                      <span className="block px-3 py-2 text-gray-300">{link.label}</span>
                    </motion.div>
                  ))}
              </motion.nav>
            )}
          </AnimatePresence>

          {/* Page-specific header */}
          <div className="px-4 py-4">
            <DashboardHeaderClient
              title="Administrators"
              actions={
                isSuperAdmin
                  ? [
                      {
                        label: "Add Admin",
                        link: "/dashboard/admins/create",
                        style: "bg-blue-600 hover:bg-blue-700 w-full sm:w-32 text-center",
                      },
                      {
                        label: "Add Category",
                        link: "/dashboard/admins/categories/create",
                        style: "bg-green-600 hover:bg-green-700 w-full sm:w-36 text-center",
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

