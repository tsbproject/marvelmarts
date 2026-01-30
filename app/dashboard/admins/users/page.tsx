import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import UsersTable from "./UsersTable";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Fetching users with relevant profile info
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      IsVerified: true,
      isSuspended: true, 
      vendorProfile: { select: { storeName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">
            User <span className="text-blue-600">Database</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
            Control Center / Account Management
          </p>
        </div>
        
        <div className="flex gap-2">
           <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black uppercase text-gray-400 block">Total Users</span>
              <span className="text-lg font-black">{users.length}</span>
           </div>
        </div>
      </div>

      {/* Table Component */}
      <UsersTable initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}