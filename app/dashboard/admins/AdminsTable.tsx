

// app/dashboard/admins/AdminsTable.tsx
"use client";

import Link from "next/link";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  adminProfile: { permissions: Record<string, boolean> };
};

export default function AdminsTable({
  admins,
  canManageAdmins,
  currentUserId,
}: {
  admins: Admin[];
  canManageAdmins: boolean;
  currentUserId: string;
}) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Email</th>
          <th className="border p-2 text-left">Role</th>
          <th className="border p-2 text-left">Created</th>
          <th className="border p-2 text-left">Permissions</th>
          <th className="border p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {(admins ?? []).map((admin) => {
          const isSelf = admin.id === currentUserId;

          // Build a list of enabled permissions
          const enabledPermissions = Object.entries(admin.adminProfile.permissions || {})
            .filter(([_, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, " $1"))
            .join(", ") || "—";

          return (
            <tr key={admin.id}>
              <td className="border p-2">{admin.name || "—"}</td>
              <td className="border p-2">{admin.email}</td>
              <td className="border p-2">{admin.role}</td>
              <td className="border p-2">
                {new Date(admin.createdAt).toLocaleString()}
              </td>
              <td className="border p-2">{enabledPermissions}</td>
              <td className="border p-2">
                <div className="flex flex-wrap gap-2">
                  {(canManageAdmins || isSelf) && (
                    <Link
                      href={`/dashboard/admins/${admin.id}/change-password`}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      Change Password
                    </Link>
                  )}

                  {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                    <>
                      <Link
                        href={`/dashboard/admins/${admin.id}/edit`}
                        className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton id={admin.id} />
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

