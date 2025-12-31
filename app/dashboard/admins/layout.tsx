



// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import SignOutButton from "@/app/_components/SignOutButton";
// import { redirect } from "next/navigation";
// import AdminProviders from "@/app/_context/AdminProviders";

// export default async function AdminLayout({ children }: { children: React.ReactNode }) {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user.role === "SUPER_ADMIN";
//   const isAdmin = user.role === "ADMIN";

//   if (!isSuperAdmin && !isAdmin) {
//     return <div className="p-4 xs:p-6 md:p-8">Access denied</div>;
//   }

//   return (
//     <DashboardSidebar>
//       <AdminProviders>
//         {/* <div className="w-full flex flex-col gap-6 px-3 xs:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8"> */}
//         <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8">

//           {/* Global header area */}
//           <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3">
//             <h2 className="text-lg xs:text-xl xs:-ml-10 md:text-2xl font-bold">Dashboard</h2>
//             {session?.user && (
//               <div className="flex flex-col xs:flex-col xs:mr-50 xs:items-center gap-2 xs:gap-3 w-full xs:w-auto">
//                 <span className="text-gray-700 text-sm xs:text-base truncate">
//                   {session.user.name} ({session.user.role})
//                 </span>
//                 <SignOutButton
//                   redirectPath="/auth/sign-in"
//                   label="Sign Out"
//                   className="
//                     px-3 py-2 xs:px-4 xs:py-2
//                     bg-red-600 text-white rounded
//                     hover:bg-red-700 transition
//                     text-sm xs:text-base
//                     w-30 xs:w-30
//                   "
//                 />
//               </div>
//             )}
//           </div>

//           {/* Page-specific header */}
//           <DashboardHeader
//             title="Administrators"
//             actions={
//               isSuperAdmin
//                 ? [
//                     {
//                       label: "Add Admin",
//                       link: "/dashboard/admins/create",
//                       style: "bg-blue-600 hover:bg-blue-700 w-32 text-center",
//                     },
//                     {
//                       label: "Add Category",
//                       link: "/dashboard/admins/categories/create",
//                       style: "bg-green-600 hover:bg-green-700 w-36 text-center",
//                     },
//                   ]
//                 : []
//             }
//           />

//           {/* Page content */}
//           <div className="flex-1">{children}</div>
//         </div>
//       </AdminProviders>
//     </DashboardSidebar>
//   );
// }



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
    return <div className="p-4 xs:p-6 md:p-8">Access denied</div>;
  }

  return (
    <DashboardSidebar>
      <AdminProviders>
        <div className="xs:w-full max-w-screen mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex flex-col gap-6">
          {/* Global header */}
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3">
            <h2 className="text-lg xs:text-xl md:text-2xl font-bold">Dashboard</h2>
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 w-full xs:w-auto">
              <span className="text-sm xs:text-base text-gray-700 truncate">
                {user.name} ({user.role})
              </span>
              <SignOutButton
                redirectPath="/auth/sign-in"
                label="Sign Out"
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm xs:text-base w-full xs:w-auto"
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
                      style: "bg-blue-600 hover:bg-blue-700 w-32 text-center",
                    },
                    {
                      label: "Add Category",
                      link: "/dashboard/admins/categories/create",
                      style: "bg-green-600 hover:bg-green-700 w-36 text-center",
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
