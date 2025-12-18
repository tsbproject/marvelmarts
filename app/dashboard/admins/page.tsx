// app/dashboard/admins/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminsTable, { Admin } from "./AdminsTable";
import { redirect } from "next/navigation";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (!isSuperAdmin && !isAdmin) {
    return <div className="p-8">Access denied</div>;
  }

  // Always initialize as an array
  let normalizedAdmins: Admin[] = [];

  if (isSuperAdmin) {
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

    normalizedAdmins = admins
      .filter((a) => a.id !== user.id) // hide self from table
      .map((a) => ({
        id: a.id,
        name: a.name ?? "",
        email: a.email,
        role: a.role as "ADMIN" | "SUPER_ADMIN",
        createdAt: a.createdAt.toISOString(),
        adminProfile: {
          permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
        },
      }));
  }

  if (isAdmin) {
    normalizedAdmins = [
      {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        adminProfile: {
          permissions: (user.permissions ?? {}) as Record<string, boolean>,
        },
      },
    ];
  }

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader
          title="Administrators"
          actions={
            isSuperAdmin
              ? [
                  {
                    label: "Add Admin",
                    link: "/dashboard/admins/create",
                    style: "bg-blue-600 hover:bg-blue-700",
                  },
                  {
                    label: "Add Category",
                    link: "/dashboard/admins/categories/create",
                    style: "bg-green-600 hover:bg-green-700",
                  },
                ]
              : []
          }
        />

        <AdminsTable
          admins={normalizedAdmins}
          canManageAdmins={isSuperAdmin}
          currentUserId={user.id}
        />
      </div>
    </DashboardSidebar>
  );
}
