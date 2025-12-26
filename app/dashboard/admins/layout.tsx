import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import SignOutButton from "@/app/_components/SignOutButton";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (!isSuperAdmin && !isAdmin) {
    return <div className="p-8">Access denied</div>;
  }

  return (
    <DashboardSidebar>
      <div className="p-8 w-full flex flex-col gap-6">
        {/* Global header area */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dashboard</h2>
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">
                {session.user.name} ({session.user.role})
              </span>
              <SignOutButton
                redirectPath="/auth/sign-in"
                label="Sign Out"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              />
            </div>
          )}
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
                    style: "bg-blue-600 hover:bg-blue-700",
                  },
                  {
                    label: "Add Category",
                    link: "/dashboard/admins/categories/create",
                    style: "bg-green-600 hover:bg-green-700",
                  },
                ]
              : []
          }
        />

        {children}
      </div>
    </DashboardSidebar>
  );
}
