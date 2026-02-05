



"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import AdminDeleteButton from "@/app/_components/AdminDeleteButton";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Key, 
  Edit3, 
  Clock,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns"; 
import { setAdmins } from "@/store/adminSlice"; 
import { RootState } from "@/store"; 
export type Admin = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  lastLogin?: string;
  adminProfile: { permissions: Record<string, boolean> };
};

export default function AdminsTable({
  initialAdmins, // Changed from 'admins' to 'initialAdmins' for hydration
  canManageAdmins,
  currentUserId,
}: {
  initialAdmins: Admin[];
  canManageAdmins: boolean;
  currentUserId: string;
}) {
  const dispatch = useDispatch();

  // 1. Hydrate Redux with data from Server Component on mount
  useEffect(() => {
    if (initialAdmins) {
      dispatch(setAdmins(initialAdmins));
    }
  }, [initialAdmins, dispatch]);

  // 2. Select live data and searchTerm from Redux
  const adminsFromRedux = useSelector((state: RootState) => state.admin.admins);
  const searchTerm = useSelector((state: RootState) => state.admin.searchTerm);

  // 3. Tactical UI Filter (Search Logic)
  const filteredAdmins = (adminsFromRedux || []).filter((admin) =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Team Management
          </h2>
          <p className="text-gray-500 text-sm font-medium">Control roles, permissions, and security access.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl text-indigo-700 text-sm font-bold uppercase">
          <Activity size={18} className="animate-pulse" />
          {filteredAdmins.length} Active Admins
        </div>
      </div>

      {/* MOBILE & MID VIEW (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredAdmins.map((admin) => {
          const isSelf = admin.id === currentUserId;
          const enabledPermissions = Object.entries(admin.adminProfile.permissions || {})
            .filter(([_, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, " $1"));

          return (
            <div key={admin.id} className="group rounded-4xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${admin.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-tight leading-tight">
                      {admin.name || "Unnamed Admin"} {isSelf && <span className="text-indigo-500 text-[10px] ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400 font-medium truncate">{admin.email}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock size={12} />
                Last Active: {admin.lastLogin ? formatDistanceToNow(new Date(admin.lastLogin)) + ' ago' : 'Never'}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {enabledPermissions.map((perm) => (
                    <span key={perm} className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg uppercase border border-blue-100">
                      {perm}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-2">
                  {(canManageAdmins || isSelf) && (
                    <Link href={`/dashboard/admins/${admin.id}/change-password`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-sm">
                      <Key size={14} /> Password
                    </Link>
                  )}
                  {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                    <>
                      <Link href={`/dashboard/admins/${admin.id}/edit`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition shadow-sm">
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

      {/* DESKTOP VIEW (Table) */}
      <div className="hidden lg:block overflow-hidden bg-white border border-gray-100 rounded-[32px] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Role</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Last Activity</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Permissions</th>
              <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredAdmins.map((admin) => {
              const isSelf = admin.id === currentUserId;
              const enabledPermissions = Object.entries(admin.adminProfile.permissions || {})
                .filter(([_, value]) => value)
                .map(([key]) => key.replace(/([A-Z])/g, " $1"));

              const isOnline = admin.lastLogin && (new Date().getTime() - new Date(admin.lastLogin).getTime() < 15 * 60 * 1000);

              return (
                <tr key={admin.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                          {admin.name?.charAt(0) || <User size={18} />}
                        </div>
                        {isOnline && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
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
                      admin.role === 'SUPER_ADMIN' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-500'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Clock size={14} className="text-gray-300" />
                        <span className="text-xs font-black uppercase tracking-tighter">
                          {admin.lastLogin ? formatDistanceToNow(new Date(admin.lastLogin)) + ' ago' : 'Never'}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-5">
                        Joined {new Date(admin.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {enabledPermissions.slice(0, 2).map((perm) => (
                        <span key={perm} className="text-[9px] font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded uppercase">
                          {perm}
                        </span>
                      ))}
                      {enabledPermissions.length > 2 && (
                        <span className="text-[9px] font-bold text-indigo-500">+{enabledPermissions.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(canManageAdmins || isSelf) && (
                        <Link href={`/dashboard/admins/${admin.id}/change-password`} title="Change Password" className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                          <Key size={16} />
                        </Link>
                      )}
                      {canManageAdmins && admin.role !== "SUPER_ADMIN" && (
                        <>
                          <Link href={`/dashboard/admins/${admin.id}/edit`} title="Edit Permissions" className="p-2.5 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
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