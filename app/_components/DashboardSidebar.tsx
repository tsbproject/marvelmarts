


"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { HomeIcon, UsersIcon, NewspaperIcon, ShieldCheckIcon, KeyIcon } from "@heroicons/react/24/outline";

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;

  const canManageAdmins = role === "SUPER_ADMIN" || permissions.manageAdmins;
  const canManageUsers = role === "SUPER_ADMIN" || permissions.manageUsers;
  const canManageBlogs = role === "SUPER_ADMIN" || permissions.manageBlogs;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        {/* Branding */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">MarvelMarts</h2>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">General</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition"
                >
                  <HomeIcon className="w-5 h-5" />
                  Overview
                </Link>
              </li>
          
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Management</p>
            <ul className="space-y-2">
              {canManageUsers && (
                <li>
                  <Link
                    href="/dashboard/users"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <UsersIcon className="w-5 h-5" />
                    Users
                  </Link>
                </li>
              )}
              {canManageBlogs && (
                <li>
                  <Link
                    href="/dashboard/blogs"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <NewspaperIcon className="w-5 h-5" />
                    Blogs
                  </Link>
                </li>
              )}
              {canManageAdmins && (
                <li>
                  <Link
                    href="/dashboard/admins"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition"
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    Admin Settings
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t text-sm text-gray-500">
          Signed in as <span className="font-medium">{session?.user?.email}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

