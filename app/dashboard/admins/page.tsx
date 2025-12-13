// app/dashboard/admins/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminsTable, { Admin } from "./AdminsTable";   // ✅ import Admin instead of AdminTableRow
import { redirect } from "next/navigation";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageAdmins = isSuperAdmin || user.permissions?.manageAdmins;

  if (!canViewPage) return <div className="p-8">Access denied</div>;

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      adminProfile: { select: { permissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const normalizedAdmins: Admin[] = admins
  .filter((a) => a.id !== user.id)
  .map((a) => ({
    id: a.id,
    name: a.name ?? "", // ✅ convert null to empty string
    email: a.email,
    role: a.role as "ADMIN" | "SUPER_ADMIN",
    createdAt: a.createdAt.toISOString(),
    adminProfile: {
      permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
    },
  }));


  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader
          title="Administrators"
          showAddButton={canManageAdmins}
          addButtonLabel="Add Admin"
          addButtonLink="/dashboard/admins/create"
        />
        <AdminsTable admins={normalizedAdmins} canManageAdmins={canManageAdmins} />
      </div>
    </DashboardSidebar>
  );
}
