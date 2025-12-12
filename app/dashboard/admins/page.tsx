// // app/dashboard/admins/page.tsx
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import AdminsTable, { AdminTableRow } from "./AdminsTable";
// import { redirect } from "next/navigation";

// export default async function AdminsPage() {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user.role === "SUPER_ADMIN";
//   const canViewPage = isSuperAdmin || user.role === "ADMIN";
//   const canManageAdmins = isSuperAdmin || user.permissions?.manageAdmins;

//   if (!canViewPage) return <div className="p-8">Access denied</div>;

//   const admins = await prisma.user.findMany({
//     where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       createdAt: true,
//       adminProfile: { select: { permissions: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   const normalizedAdmins: AdminTableRow[] = admins
//     .filter((a) => a.id !== user.id)
//     .map((a) => ({
//       id: a.id,
//       name: a.name,
//       email: a.email,
//       role: a.role as "ADMIN" | "SUPER_ADMIN",
//       createdAt: a.createdAt.toISOString(),
//       permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
//     }));

//   return (
//     <DashboardSidebar>
//       <div className="p-8 w-full">
//         <DashboardHeader
//           title="Administrators"
//           showAddButton={canManageAdmins}
//           addButtonLabel="Add Admin"
//           addButtonLink="/dashboard/admins/create"
//         />
//         <AdminsTable admins={normalizedAdmins} canManageAdmins={canManageAdmins} />
//       </div>
//     </DashboardSidebar>
//   );
// }


// app/dashboard/admins/page.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminsTable, { AdminRow } from "./AdminsTable";
import { useNotification } from "@/app/_context/NotificationContext";

export default function AdminsPageClient() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admins");
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || "Failed to load admins");
        return;
      }
      // data.admins expected
      setAdmins(data.admins ?? []);
    } catch (err) {
      notifyError("Server error loading admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader
          title="Administrators"
          showAddButton={true}
          addButtonLabel="Add Admin"
          addButtonLink="/dashboard/admins/create"
        />

        <div className="mt-4">
          {loading ? (
            <div className="p-4 text-center">Loading admins...</div>
          ) : (
            <AdminsTable admins={admins} refresh={load} />
          )}
        </div>
      </div>
    </DashboardSidebar>
  );
}

