// "use client";

// import Link from "next/link";
// import AdminDeleteButton from "@/app/_components/AdminDeleteButton";

// export type Admin = {
//   id: string;
//   name: string;
//   email: string;
//   role: "ADMIN" | "SUPER_ADMIN";
//   createdAt: string;
//   adminProfile: { permissions: Record<string, boolean> };
// };

// export default function AdminsTable({
//   admins,
//   canManageAdmins,
//   currentUserId,
// }: {
//   admins: Admin[];
//   canManageAdmins: boolean;
//   currentUserId: string;
// }) {
//   return (
//     <div className="w-full">
//       {/* ===================== */}
//       {/* MOBILE VIEW (Cards) */}
//       {/* ===================== */}
//       <div className="space-y-4 md:hidden">
//         {(admins ?? []).map((admin) => {
//           const isSelf = admin.id === currentUserId;

//           const enabledPermissions =
//             Object.entries(admin.adminProfile.permissions || {})
//               .filter(([_, value]) => value)
//               .map(([key]) => key.replace(/([A-Z])/g, " $1"))
//               .join(", ") || "—";

//           return (
//             <div
//               key={admin.id}
//               className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
//             >
//               <div className="space-y-3 text-sm sm:text-base">
//                 <div>
//                   <p className="text-gray-500">Name</p>
//                   <p className="font-semibold">{admin.name || "—"}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Email</p>
//                   <p className="wrap-break-words">{admin.email}</p>
//                 </div>

//                 <div className="flex flex-wrap gap-4">
//                   <div>
//                     <p className="text-gray-500">Role</p>
//                     <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
//                       {admin.role}
//                     </span>
//                   </div>

//                   <div>
//                     <p className="text-gray-500">Created</p>
//                     <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Permissions</p>
//                   <p className="text-xs">{enabledPermissions}</p>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="mt-4 flex flex-wrap gap-2">
//                 {(canManageAdmins || isSelf) && (
//                   <Link
//                     href={`/dashboard/admins/${admin.id}/change-password`}
//                     className="px-3 py-1 rounded bg-indigo-600 text-white text-xs sm:text-sm hover:bg-indigo-700 transition"
//                   >
//                     Change Password
//                   </Link>
//                 )}

//                 {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
//                   <>
//                     <Link
//                       href={`/dashboard/admins/${admin.id}/edit`}
//                       className="px-3 py-1 rounded bg-yellow-600 text-white text-xs sm:text-sm hover:bg-yellow-700 transition"
//                     >
//                       Edit
//                     </Link>
//                     <AdminDeleteButton id={admin.id} />
//                   </>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ===================== */}
//       {/* DESKTOP VIEW (Table) */}
//       {/* ===================== */}
//       <div className="hidden md:block overflow-x-auto">
//         <table className="w-full border-collapse border border-gray-300 text-sm sm:text-base">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border p-2 sm:p-3 text-left">Name</th>
//               <th className="border p-2 sm:p-3 text-left">Email</th>
//               <th className="border p-2 sm:p-3 text-left">Role</th>
//               <th className="border p-2 sm:p-3 text-left">Created</th>
//               <th className="border p-2 sm:p-3 text-left">Permissions</th>
//               <th className="border p-2 sm:p-3 text-left">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {(admins ?? []).map((admin) => {
//               const isSelf = admin.id === currentUserId;

//               const enabledPermissions =
//                 Object.entries(admin.adminProfile.permissions || {})
//                   .filter(([_, value]) => value)
//                   .map(([key]) => key.replace(/([A-Z])/g, " $1"))
//                   .join(", ") || "—";

//               return (
//                 <tr key={admin.id} className="hover:bg-gray-50 transition">
//                   <td className="border p-2 sm:p-3">{admin.name || "—"}</td>
//                   <td className="border p-2 sm:p-3 wrap-break-words">{admin.email}</td>
//                   <td className="border p-2 sm:p-3 font-semibold">{admin.role}</td>
//                   <td className="border p-2 sm:p-3">
//                     {new Date(admin.createdAt).toLocaleString()}
//                   </td>
//                   <td className="border p-2 sm:p-3 text-xs sm:text-sm">
//                     {enabledPermissions}
//                   </td>
//                   <td className="border p-2 sm:p-3">
//                     <div className="flex flex-wrap gap-2">
//                       {(canManageAdmins || isSelf) && (
//                         <Link
//                           href={`/dashboard/admins/${admin.id}/change-password`}
//                           className="px-3 py-1 rounded bg-indigo-600 text-white text-xs sm:text-sm hover:bg-indigo-700 transition"
//                         >
//                           Change Password
//                         </Link>
//                       )}

//                       {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
//                         <>
//                           <Link
//                             href={`/dashboard/admins/${admin.id}/edit`}
//                             className="px-3 py-1 rounded bg-yellow-600 text-white text-xs sm:text-sm hover:bg-yellow-700 transition"
//                           >
//                             Edit
//                           </Link>
//                           <AdminDeleteButton id={admin.id} />
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


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
    <div className="w-full max-w-screen-lg mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
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
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm w-full"
            >
              <div className="space-y-3 text-sm sm:text-base">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold">{admin.name || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="break-words">{admin.email}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-gray-500">Role</p>
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                      {admin.role}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-500">Created</p>
                    <p>{new Date(admin.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500">Permissions</p>
                  <p className="text-xs break-words">{enabledPermissions}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col xs:flex-row flex-wrap gap-2 w-full">
                {(canManageAdmins || isSelf) && (
                  <Link
                    href={`/dashboard/admins/${admin.id}/change-password`}
                    className="px-3 py-2 rounded bg-indigo-600 text-white text-xs xs:text-sm hover:bg-indigo-700 transition w-full xs:w-auto text-center"
                  >
                    Change Password
                  </Link>
                )}

                {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                  <>
                    <Link
                      href={`/dashboard/admins/${admin.id}/edit`}
                      className="px-3 py-2 rounded bg-yellow-600 text-white text-xs xs:text-sm hover:bg-yellow-700 transition w-full xs:w-auto text-center"
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
      <div className="hidden lg:block overflow-x-auto mt-6">
        <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 sm:p-3 text-left">Name</th>
              <th className="border p-2 sm:p-3 text-left">Email</th>
              <th className="border p-2 sm:p-3 text-left">Role</th>
              <th className="border p-2 sm:p-3 text-left">Created</th>
              <th className="border p-2 sm:p-3 text-left">Permissions</th>
              <th className="border p-2 sm:p-3 text-left">Actions</th>
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
                  <td className="border p-2 sm:p-3">{admin.name || "—"}</td>
                  <td className="border p-2 sm:p-3 break-words">{admin.email}</td>
                  <td className="border p-2 sm:p-3 font-semibold">{admin.role}</td>
                  <td className="border p-2 sm:p-3">
                    {new Date(admin.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2 sm:p-3 text-xs sm:text-sm break-words">
                    {enabledPermissions}
                  </td>
                  <td className="border p-2 sm:p-3">
                    <div className="flex flex-wrap gap-2">
                      {(canManageAdmins || isSelf) && (
                        <Link
                          href={`/dashboard/admins/${admin.id}/change-password`}
                          className="px-3 py-2 rounded bg-indigo-600 text-white text-xs sm:text-sm hover:bg-indigo-700 transition"
                        >
                          Change Password
                        </Link>
                      )}

                      {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                        <>
                          <Link
                            href={`/dashboard/admins/${admin.id}/edit`}
                            className="px-3 py-2 rounded bg-yellow-600 text-white text-xs sm:text-sm hover:bg-yellow-700 transition"
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
  );
}