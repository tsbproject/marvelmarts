


// "use client";

// import Link from "next/link";
// import { useSession } from "next-auth/react";
// import { ReactNode, useMemo } from "react";
// import {
//   HomeIcon,
//   UsersIcon,
//   NewspaperIcon,
//   ShieldCheckIcon,
//   KeyIcon,
//   Squares2X2Icon, // 🔹 icon for Categories
// } from "@heroicons/react/24/outline";

// interface DashboardSidebarProps {
//   children: ReactNode;
// }

// export default function DashboardSidebar({ children }: DashboardSidebarProps) {
//   const { data: session } = useSession();
//   const permissions = session?.user?.permissions ?? {};
//   const role = session?.user?.role;
//   const isSuperAdmin = role === "SUPER_ADMIN";

//   // Define sections and links
//   const sections = useMemo(() => {
//     const general = [
//       {
//         label: "Overview",
//         href: "/dashboard",
//         icon: <HomeIcon className="w-5 h-5" />,
//         visible: true,
//       },
//     ];

//     const management = [
//       {
//         label: "Admins",
//         href: "/dashboard/admins",
//         icon: <ShieldCheckIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageAdmins,
//       },
//       {
//         label: "Users",
//         href: "/dashboard/users",
//         icon: <UsersIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageUsers,
//       },
//       {
//         label: "Blogs",
//         href: "/dashboard/blogs",
//         icon: <NewspaperIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageBlogs,
//       },
//       {
//         label: "Products",
//         href: "/dashboard/products",
//         icon: <KeyIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageProducts,
//       },
//       {
//         label: "Orders",
//         href: "/dashboard/orders",
//         icon: <KeyIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageOrders,
//       },
//       {
//         label: "Categories", // 🔹 new sidebar item
//         href: "/dashboard/categories",
//         icon: <Squares2X2Icon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageCategories,
//       },
//     ];

//     return {
//       general: general.filter((item) => item.visible),
//       management: management.filter((item) => item.visible),
//     };
//   }, [isSuperAdmin, permissions]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside className="w-75 bg-brand-primary border-r shadow-sm flex flex-col">
//         {/* Branding */}
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-900">MarvelMarts</h2>
//           <p className="text-xl text-gray-50">Dashboard</p>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 px-4 py-6 space-y-6">
//           {sections.general.length > 0 && (
//             <div>
//               <p className="text-xl font-semibold text-gray-50 uppercase mb-2">
//                 General
//               </p>
//               <ul className="space-y-3">
//                 {sections.general.map((link) => (
//                   <li key={link.href}>
//                     <Link
//                       href={link.href}
//                       className="flex items-center text-2xl gap-2 px-3 py-2 rounded-lg text-gray-950 hover:bg-gray-100 hover:text-black transition"
//                     >
//                       {link.icon}
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {sections.management.length > 0 && (
//             <div>
//               <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">
//                 Management
//               </p>
//               <ul className="space-y-2">
//                 {sections.management.map((link) => (
//                   <li key={link.href}>
//                     <Link
//                       href={link.href}
//                       className="flex items-center gap-2 px-3 py-2 rounded-lg text-black text-2xl hover:bg-gray-50 hover:text-black transition"
//                     >
//                       {link.icon}
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </nav>

//         {/* Footer */}
//         <div className="px-4 py-4 border-t text-sm text-gray-500">
//           Signed in as{" "}
//           <span className="font-medium">{session?.user?.email ?? "Unknown"}</span>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-8">{children}</main>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo } from "react";
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
  Squares2X2Icon,
  Cog6ToothIcon, // 🔹 icon for Settings
} from "@heroicons/react/24/outline";

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const sections = useMemo(() => {
    const general = [
      {
        label: "Overview",
        href: "/dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        visible: true,
      },
    ];

    const management = [
      {
        label: "Admins",
        href: "/dashboard/admins/admins",
        icon: <ShieldCheckIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageAdmins,
      },
      {
        label: "Users",
        href: "/dashboard/admins/users",
        icon: <UsersIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageUsers,
      },
      {
        label: "Blogs",
        href: "/dashboard/blogs",
        icon: <NewspaperIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageBlogs,
      },
      {
        label: "Products",
        href: "/dashboard/admins/products",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageProducts,
      },
      {
        label: "Orders",
        href: "/dashboard/admins/orders",
        icon: <KeyIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageOrders,
      },
      {
        label: "Categories",
        href: "/dashboard/admins/categories",
        icon: <Squares2X2Icon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageCategories,
      },
      {
        label: "Settings",
        href: "/dashboard/admins/settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        visible: isSuperAdmin || permissions.manageSettings,
      },
    ];

    // 🔹 Build a Permissions section for ADMIN
    const permissionsMenu = Object.entries(permissions)
      .filter(([_, value]) => value) // only enabled permissions
      .map(([key]) => ({
        label: key.replace(/([A-Z])/g, " $1"), // format nicely
        href: "#", // or link to a permissions info page
        icon: <ShieldCheckIcon className="w-5 h-5" />,
        visible: true,
      }));

    return {
      general: general.filter((item) => item.visible),
      management: management.filter((item) => item.visible),
      permissionsMenu,
    };
  }, [isSuperAdmin, permissions]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-75 bg-brand-primary border-r shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">MarvelMarts</h2>
          <p className="text-xl text-gray-50">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6">
          {sections.general.length > 0 && (
            <div>
              <p className="text-xl font-semibold text-gray-50 uppercase mb-2">
                General
              </p>
              <ul className="space-y-3">
                {sections.general.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center text-2xl gap-2 px-3 py-2 rounded-lg text-gray-950 hover:bg-gray-100 hover:text-black transition"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sections.management.length > 0 && (
            <div>
              <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">
                Management
              </p>
              <ul className="space-y-2">
                {sections.management.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-black text-2xl hover:bg-gray-50 hover:text-black transition"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 🔹 Permissions section for ADMIN */}
          {!isSuperAdmin && sections.permissionsMenu.length > 0 && (
            <div>
              <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">
                My Permissions
              </p>
              <ul className="space-y-2">
                {sections.permissionsMenu.map((link) => (
                  <li key={link.label}>
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 text-xl">
                      {link.icon}
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="px-4 py-4 border-t text-sm text-gray-500">
          Signed in as{" "}
          <span className="font-medium">{session?.user?.email ?? "Unknown"}</span>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
