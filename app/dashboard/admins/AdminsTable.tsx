
"use client";

import { useState, ChangeEvent, useMemo, FC } from "react";
import Link from "next/link";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";
import { format } from "date-fns";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  adminProfile?: {
    permissions: Record<string, boolean>;
  };
  createdAt: string;
}

interface AdminsTableProps {
  admins: Admin[];
  canManageAdmins: boolean;
}

const AdminsTable: FC<AdminsTableProps> = ({ admins, canManageAdmins }) => {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Memoize filtered admins for performance
  const filteredAdmins = useMemo(
    () =>
      admins.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
      ),
    [admins, search]
  );

  return (
    <>
      <div className="my-4 flex justify-end">
        <input
          type="text"
          placeholder="Search admins..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          aria-label="Search admins"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Email", "Role", "Permissions", "Created", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xl font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                )
              )}
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
                    {a.adminProfile?.permissions
                      ? Object.entries(a.adminProfile.permissions)
                          .filter(([_, value]) => value)
                          .map(([key]) => key)
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
                      <span className="text-gray-400 text-2xl italic">No permission</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminsTable;




