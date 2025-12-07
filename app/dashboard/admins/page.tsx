"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";
import { format } from "date-fns";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  permissions: Record<string, boolean>;
  createdAt: string;
}

interface AdminsApiResponse {
  admins: Admin[];
}

export default function AdminsPage() {
  const { data: session, status } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = session?.user;

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canManageAdmins = isSuperAdmin || user?.permissions?.manageAdmins;
  const canViewPage = isSuperAdmin || user?.role === "ADMIN";

  // -----------------------------
  // Fetch admins (allow ADMIN to VIEW only)
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    async function fetchAdmins() {
      try {
        const res = await fetch("/api/admin/list");
        if (!res.ok) throw new Error("Failed to fetch admins");
        const data: AdminsApiResponse = await res.json();

        // Remove current user from list to avoid self-management
        const filtered = data.admins.filter((a) => a.id !== user.id);

        setAdmins(filtered);
      } catch (err) {
        console.error("Error fetching admins:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, [user]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // -----------------------------
  // Access control logic
  // -----------------------------
  if (status === "loading") return <div className="p-8">Loading session...</div>;
  if (!user || !canViewPage) return <div className="p-8">Access denied</div>;

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">

        <DashboardHeader
          title="Administrators"
          showAddButton={canManageAdmins} // Only super admin or admins with permission
          addButtonLabel="Add Admin"
          addButtonLink="/dashboard/admins/create"
        />

        <div className="my-4 flex justify-end">
          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={handleSearchChange}
            className="p-2 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading admins...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Permissions</th>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-xl font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-xl font-medium text-gray-900">{a.name}</td>
                      <td className="px-6 py-4 text-xl text-gray-600">{a.email}</td>
                      <td className="px-6 py-4 text-xl text-gray-600">{a.role}</td>

                      <td className="px-6 py-4 text-xl text-gray-600">
                        {a.permissions
                          ? Object.keys(a.permissions)
                              .filter((k) => a.permissions[k])
                              .join(", ")
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-xl text-gray-600">
                        {format(new Date(a.createdAt), "yyyy-MM-dd")}
                      </td>

                      <td className="px-6 py-4 text-sm flex space-x-2">
                        {canManageAdmins ? (
                          <>
                            <Link
                              href={`/dashboard/admins/${a.id}/edit`}
                              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              Edit
                            </Link>

                            <Link
                              href={`/dashboard/admins/${a.id}/change-password`}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                            >
                              Change Password
                            </Link>

                            <AdminDeleteButton id={a.id} />
                          </>
                        ) : (
                          <span className="text-gray-400 text-2xl italic">
                            No permission
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardSidebar>
  );
}
