import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { format } from "date-fns";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === undefined) {
    return <div className="p-8">Unauthorized</div>;
  }

  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return <div className="p-8">Forbidden</div>;
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Administrators</h1>

          {session.user.role === "SUPER_ADMIN" && (
            <Link href="/dashboard/admins/create" className="px-4 py-2 bg-black text-white rounded">
              Add Admin
            </Link>
          )}
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Permissions</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.role}</td>
                  <td className="p-3">
                    {a.permissions
                      ? Object.keys(a.permissions).filter(k => a.permissions[k]).join(", ")
                      : "—"}
                  </td>
                  <td className="p-3">{format(new Date(a.createdAt), "yyyy-MM-dd")}</td>
                  <td className="p-3 space-x-2">
                    {session.user.role === "SUPER_ADMIN" && (
                      <>
                        <Link
                          href={`/dashboard/admins/${a.id}/edit`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <AdminDeleteButton id={a.id} /> 
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardSidebar>
  );
}

