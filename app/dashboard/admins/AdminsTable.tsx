




"use client";

import Link from "next/link";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Key, 
  Edit3, 
  Settings2 
} from "lucide-react";

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
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Team Management
          </h2>
          <p className="text-gray-500 text-sm font-medium">Control roles, permissions, and security access.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl text-indigo-700 text-sm font-bold uppercase">
          <ShieldCheck size={18} />
          {admins.length} Active Admins
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE & MID VIEW (Cards) - Visible up to 1024px (lg) */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {(admins ?? []).map((admin) => {
          const isSelf = admin.id === currentUserId;
          const enabledPermissions = Object.entries(admin.adminProfile.permissions || {})
            .filter(([_, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, " $1"));

          return (
            <div
              key={admin.id}
              className="group rounded-[32px] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${admin.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-tight leading-tight">
                      {admin.name || "Unnamed Admin"} {isSelf && <span className="text-indigo-500 text-[10px] ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400 font-medium truncate max-w-[150px] sm:max-w-xs">{admin.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  admin.role === 'SUPER_ADMIN' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {admin.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {enabledPermissions.map((perm) => (
                    <span key={perm} className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg uppercase border border-blue-100">
                      {perm}
                    </span>
                  ))}
                  {enabledPermissions.length === 0 && <span className="text-xs text-gray-400 italic">No specific permissions</span>}
                </div>

                <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-2">
                  {(canManageAdmins || isSelf) && (
                    <Link
                      href={`/dashboard/admins/${admin.id}/change-password`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-sm"
                    >
                      <Key size={14} /> Password
                    </Link>
                  )}

                  {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                    <>
                      <Link
                        href={`/dashboard/admins/${admin.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-sm"
                      >
                        <Edit3 size={14} /> Edit
                      </Link>
                      <AdminDeleteButton id={admin.id} />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== */}
      {/* DESKTOP VIEW (Table) - Visible from 1024px (lg) */}
      {/* ===================== */}
      <div className="hidden lg:block overflow-hidden bg-white border border-gray-100 rounded-[32px] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Role</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Created</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Permissions</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {(admins ?? []).map((admin) => {
              const isSelf = admin.id === currentUserId;
              const enabledPermissions = Object.entries(admin.adminProfile.permissions || {})
                .filter(([_, value]) => value)
                .map(([key]) => key.replace(/([A-Z])/g, " $1"));

              return (
                <tr key={admin.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {admin.name?.charAt(0) || <User size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 tracking-tight flex items-center gap-2">
                          {admin.name || "—"}
                          {isSelf && <span className="bg-indigo-100 text-indigo-600 text-[9px] px-2 py-0.5 rounded-full uppercase">You</span>}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                      admin.role === 'SUPER_ADMIN' 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                      : 'bg-gray-50 border-gray-100 text-gray-500'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} className="opacity-40" />
                      <span className="text-xs font-medium">{new Date(admin.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {enabledPermissions.slice(0, 3).map((perm) => (
                        <span key={perm} className="text-[9px] font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded uppercase">
                          {perm}
                        </span>
                      ))}
                      {enabledPermissions.length > 3 && (
                        <span className="text-[9px] font-bold text-indigo-500">+{enabledPermissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(canManageAdmins || isSelf) && (
                        <Link
                          href={`/dashboard/admins/${admin.id}/change-password`}
                          title="Change Password"
                          className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                        >
                          <Key size={16} />
                        </Link>
                      )}
                      {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                        <>
                          <Link
                            href={`/dashboard/admins/${admin.id}/edit`}
                            title="Edit Permissions"
                            className="p-2.5 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 size={16} />
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