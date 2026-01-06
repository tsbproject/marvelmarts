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
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      {/* ===================== */}
      {/* MOBILE VIEW (Cards) */}
      {/* ===================== */}
      <div className="space-y-4 lg:hidden">
        {(admins ?? []).map((admin) => {
          const isSelf = admin.id === currentUserId;

          const enabledPermissions =
            Object.entries(admin.adminProfile.permissions || {})
              .filter(([_, value]) => value)
              .map(([key]) => key.replace(/([A-Z])/g, " $1"))
              .join(", ") || "—";

          return (
            <div
              key={admin.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm w-full text-base sm:text-lg"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm sm:text-base">Name</p>
                  <p className="font-semibold">{admin.name || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm sm:text-base">Email</p>
                  <p className="wrap-wrap-break-words">{admin.email}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-gray-500 text-sm sm:text-base">Role</p>
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-base font-semibold">
                      {admin.role}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm sm:text-base">Created</p>
                    <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm sm:text-base">Permissions</p>
                  <p className="wrap-wrap-break-words">{enabledPermissions}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                {(canManageAdmins || isSelf) && (
                  <Link
                    href={`/dashboard/admins/${admin.id}/change-password`}
                    className="px-3 py-2 rounded bg-indigo-600 text-white text-base sm:text-lg hover:bg-indigo-700 transition w-full sm:w-auto text-center"
                  >
                    Change Password
                  </Link>
                )}

                {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                  <>
                    <Link
                      href={`/dashboard/admins/${admin.id}/edit`}
                      className="px-3 py-2 rounded bg-yellow-600 text-white text-base sm:text-lg hover:bg-yellow-700 transition w-full sm:w-auto text-center"
                    >
                      Edit
                    </Link>
                    <AdminDeleteButton id={admin.id} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== */}
      {/* DESKTOP VIEW (Table) */}
      {/* ===================== */}
      <div className="hidden lg:block mt-6 w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse border border-gray-300 text-base sm:text-lg md:text-xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-3 text-left align-middle w-[18%]">Name</th>
                <th className="border px-4 py-3 text-left align-middle w-[26%]">Email</th>
                <th className="border px-4 py-3 text-left align-middle w-[10%]">Role</th>
                <th className="border px-4 py-3 text-left align-middle w-[15%]">Created</th>
                <th className="border px-4 py-3 text-left align-middle w-[25%]">Permissions</th>
                <th className="border px-4 py-3 text-left align-middle w-[34%]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {(admins ?? []).map((admin) => {
                const isSelf = admin.id === currentUserId;
                const enabledPermissions =
                  Object.entries(admin.adminProfile.permissions || {})
                    .filter(([_, value]) => value)
                    .map(([key]) => key.replace(/([A-Z])/g, " $1"))
                    .join(", ") || "—";

                return (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-3 align-middle wrap-break-words">{admin.name || "—"}</td>
                    <td className="border px-4 py-3 align-middle wrap-break-words">{admin.email}</td>
                    <td className="border px-4 py-3 align-middle font-semibold">{admin.role}</td>
                    <td className="border px-4 py-3 align-middle">
                      {new Date(admin.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-3 align-middle wrap-break-words">{enabledPermissions}</td>
                    <td className="border px-4 py-3 align-middle">
                      <div className="flex items-center flex-wrap gap-2">
                        {(canManageAdmins || isSelf) && (
                          <Link
                            href={`/dashboard/admins/${admin.id}/change-password`}
                            className="px-3 py-2 rounded bg-indigo-600 text-white text-base hover:bg-indigo-700 transition"
                          >
                            Change Password
                          </Link>
                        )}
                        {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                          <>
                            <Link
                              href={`/dashboard/admins/${admin.id}/edit`}
                              className="px-3 py-2 rounded bg-yellow-600 text-white text-base hover:bg-yellow-700 transition"
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
        </div>
      </div>
    </div>
  );
}
