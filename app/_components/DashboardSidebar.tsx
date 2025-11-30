// components/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;

  const canManageAdmins = role === "SUPER_ADMIN" || permissions.manageAdmins;
  const canManageUsers = role === "SUPER_ADMIN" || permissions.manageUsers;
  const canManageBlogs = role === "SUPER_ADMIN" || permissions.manageBlogs;

  return (
    <aside className="w-64 p-4 bg-white border-r">
      <nav className="space-y-2">
        <Link href="/dashboard">Overview</Link>
        {canManageUsers && <Link href="/dashboard/users">Users</Link>}
        {canManageBlogs && <Link href="/dashboard/blogs">Blogs</Link>}
        {role === "SUPER_ADMIN" || permissions.manageAdmins ? (
          <Link href="/dashboard/admins">Admin Settings</Link>
        ) : null}
      </nav>
    </aside>
  );
}
