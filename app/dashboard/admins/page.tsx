// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import AdminsTable, { Admin } from "./AdminsTable";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { redirect } from "next/navigation";

// export default async function AdminsPage() {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user?.role === "SUPER_ADMIN";
//   const isAdmin = user?.role === "ADMIN";

//   let normalizedAdmins: Admin[] = [];

//   if (isSuperAdmin) {
//     const admins = await prisma.user.findMany({
//       where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         adminProfile: { select: { permissions: true } },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     normalizedAdmins = admins
//       .filter((a) => a.id !== user?.id)
//       .map((a) => ({
//         id: a.id,
//         name: a.name ?? "",
//         email: a.email,
//         role: a.role as "ADMIN" | "SUPER_ADMIN",
//         createdAt: a.createdAt.toISOString(),
//         adminProfile: {
//           permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
//         },
//       }));
//   }

//   if (isAdmin && user) {
//     normalizedAdmins = [
//       {
//         id: user.id,
//         name: user.name ?? "",
//         email: user.email,
//         role: "ADMIN",
//         createdAt: new Date().toISOString(),
//         adminProfile: {
//           permissions: (user.permissions ?? {}) as Record<string, boolean>,
//         },
//       },
//     ];
//   }

//   return (
//     <div className="w-full xs:w-50 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
//       {/* Page Header */}
//       <DashboardHeader title="" />

//       {/* Table wrapper */}
//       <div className="mt-4 mr-50 overflow-x-auto">
//         <AdminsTable
//           admins={normalizedAdmins}
//           canManageAdmins={isSuperAdmin ?? false}
//           currentUserId={user?.id ?? ""}
//         />
//       </div>
//     </div>
//   );
// }



import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import AdminsTable, { Admin } from "./AdminsTable";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { redirect } from "next/navigation";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";

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
        adminProfile: { select: { permissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    normalizedAdmins = admins
      .filter((a) => a.id !== user?.id)
      .map((a) => ({
        id: a.id,
        name: a.name ?? "",
        email: a.email,
        role: a.role as "ADMIN" | "SUPER_ADMIN",
        createdAt: a.createdAt.toISOString(),
        adminProfile: {
          permissions: (a.adminProfile?.permissions ?? {}) as Record<string, boolean>,
        },
      }));
  }

  if (isAdmin && user) {
    normalizedAdmins = [
      {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        adminProfile: {
          permissions: (user.permissions ?? {}) as Record<string, boolean>,
        },
      },
    ];
  }

  return (
    <div className="w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
      {/* Page Header */}
      <DashboardHeader title="Administrators" />

      {/* Table wrapper */}
      <div className="mt-4 overflow-x-auto">
        <AdminsTable
          admins={normalizedAdmins}
          canManageAdmins={isSuperAdmin ?? false}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </div>
  );
}

