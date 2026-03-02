


export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import AdminsTable, { Admin } from "./AdminsTable";
import { redirect } from "next/navigation";
import AdminNotificationBell from "@/app/_components/AdminNotificationBell";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  
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
        updatedAt: true,
        adminProfile: { select: { permissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    normalizedAdmins = admins
      .filter((a) => a.id !== user.id)
      .map((a) => ({
        id: a.id,
        name: a.name ?? "",
        email: a.email,
        role: a.role as "ADMIN" | "SUPER_ADMIN",
        createdAt: a.createdAt.toISOString(),
        lastLogin: a.updatedAt.toISOString(), 
        adminProfile: {
          permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
        },
      }));
  } else if (isAdmin) {
    normalizedAdmins = [
      {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        adminProfile: {
          permissions: (user.permissions ?? {}) as Record<string, boolean>,
        },
      },
    ];
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-8">
      
      {/* Welcome Section */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#002B5B] rounded-[2.5rem] p-10 flex items-center justify-between overflow-hidden relative shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-blue-200/60 font-black uppercase text-[10px] tracking-[0.4em]">
                    System Secure & Online
                  </span>
                </div>
                <h2 className="text-white text-4xl font-black italic uppercase tracking-tighter leading-none">
                    Welcome back, <span className="text-[#F7931E]">{user.name?.split(' ')[0]}</span>
                </h2>
                <p className="text-blue-100/40 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">
                    MarvelMarts Command Center • 2026
                </p>
            </div>

            {/* Notification & Identity Section */}
            <div className="relative z-20 flex items-center gap-6">
              <AdminNotificationBell />
              
              <div className="absolute right-[-30px] top-[-30px] opacity-[0.03] rotate-12 pointer-events-none -z-10">
                  <img src="/logo.png" alt="" className="h-64 brightness-0 invert" />
              </div>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4">
        <AdminsTable
          initialAdmins={normalizedAdmins}
          canManageAdmins={isSuperAdmin}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}