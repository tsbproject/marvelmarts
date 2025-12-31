


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import SignOutButton from "@/app/_components/SignOutButton";
import { redirect } from "next/navigation";
import AdminProviders from "@/app/_context/AdminProviders";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (!isSuperAdmin && !isAdmin) {
    return <div className="p-4 sm:p-6 md:p-8">Access denied</div>;
  }

  return (
    <DashboardSidebar>
      <AdminProviders>
        <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex flex-col gap-6 overflow-hidden">
          {/* Global header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Dashboard</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-sm sm:text-base text-gray-700 truncate">
                {user.name} ({user.role})
              </span>
              <SignOutButton
                redirectPath="/auth/sign-in"
                label="Sign Out"
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm sm:text-base w-full sm:w-auto text-center"
              />
            </div>
          </div>

          {/* Page-specific header */}
          <DashboardHeader
            title="Administrators"
            actions={
              isSuperAdmin
                ? [
                    {
                      label: "Add Admin",
                      link: "/dashboard/admins/create",
                      style: "bg-blue-600 hover:bg-blue-700 w-full sm:w-32 text-center",
                    },
                    {
                      label: "Add Category",
                      link: "/dashboard/admins/categories/create",
                      style: "bg-green-600 hover:bg-green-700 w-full sm:w-36 text-center",
                    },
                  ]
                : []
            }
          />

          {/* Page content */}
          <div className="w-full">{children}</div>
        </div>
      </AdminProviders>
    </DashboardSidebar>
  );
}
