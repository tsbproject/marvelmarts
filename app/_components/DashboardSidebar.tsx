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
//   Squares2X2Icon,
//   Cog6ToothIcon, // 🔹 icon for Settings
// } from "@heroicons/react/24/outline";

// interface DashboardSidebarProps {
//   children: ReactNode;
// }

// export default function DashboardSidebar({ children }: DashboardSidebarProps) {
//   const { data: session } = useSession();
//   const permissions = session?.user?.permissions ?? {};
//   const role = session?.user?.role;
//   const isSuperAdmin = role === "SUPER_ADMIN";

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
//         href: "/dashboard/admins/users",
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
//         href: "/dashboard/admins/products",
//         icon: <KeyIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageProducts,
//       },
//       {
//         label: "Orders",
//         href: "/dashboard/admins/orders",
//         icon: <KeyIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageOrders,
//       },
//       {
//         label: "Categories",
//         href: "/dashboard/admins/categories",
//         icon: <Squares2X2Icon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageCategories,
//       },
//       {
//         label: "Settings",
//         href: "/dashboard/admins/settings",
//         icon: <Cog6ToothIcon className="w-5 h-5" />,
//         visible: isSuperAdmin || permissions.manageSettings,
//       },
//     ];

//     // 🔹 Build a Permissions section for ADMIN
//     const permissionsMenu = Object.entries(permissions)
//       .filter(([_, value]) => value) // only enabled permissions
//       .map(([key]) => ({
//         label: key.replace(/([A-Z])/g, " $1"), // format nicely
//         href: "#", // or link to a permissions info page
//         icon: <ShieldCheckIcon className="w-5 h-5" />,
//         visible: true,
//       }));

//     return {
//       general: general.filter((item) => item.visible),
//       management: management.filter((item) => item.visible),
//       permissionsMenu,
//     };
//   }, [isSuperAdmin, permissions]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <aside className="w-75 bg-brand-primary border-r shadow-sm flex flex-col">
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-900">MarvelMarts</h2>
//           <p className="text-xl text-gray-50">Dashboard</p>
//         </div>

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

//           {/* 🔹 Permissions section for ADMIN */}
//           {!isSuperAdmin && sections.permissionsMenu.length > 0 && (
//             <div>
//               <p className="text-2xl font-semibold text-gray-50 uppercase mb-2">
//                 My Permissions
//               </p>
//               <ul className="space-y-2">
//                 {sections.permissionsMenu.map((link) => (
//                   <li key={link.label}>
//                     <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 text-xl">
//                       {link.icon}
//                       {link.label}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </nav>

//         <div className="px-4 py-4 border-t text-sm text-gray-500">
//           Signed in as{" "}
//           <span className="font-medium">{session?.user?.email ?? "Unknown"}</span>
//         </div>
//       </aside>

//       <main className="flex-1 p-8">{children}</main>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DashboardSidebarProps {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? {};
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [open, setOpen] = useState(false);

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
        href: "/dashboard/admins",
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

    const permissionsMenu = Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => ({
        label: key.replace(/([A-Z])/g, " $1"),
        icon: <ShieldCheckIcon className="w-5 h-5" />,
      }));

    return {
      general: general.filter((i) => i.visible),
      management: management.filter((i) => i.visible),
      permissionsMenu,
    };
  }, [isSuperAdmin, permissions]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setOpen(true)}>
          <Bars3Icon className="w-6 h-6 text-gray-900" />
        </button>
        <span className="font-semibold text-gray-900">Dashboard</span>
      </header>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-72 bg-brand-primary text-white
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
          border-r shadow-sm
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">MarvelMarts</h2>
            <p className="text-sm text-white/70">Dashboard</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-4 py-6 space-y-6 overflow-y-auto">
          {sections.general.length > 0 && (
            <SidebarSection title="General">
              {sections.general.map((l) => (
                <SidebarLink key={l.href} {...l} onClick={() => setOpen(false)} />
              ))}
            </SidebarSection>
          )}

          {sections.management.length > 0 && (
            <SidebarSection title="Management">
              {sections.management.map((l) => (
                <SidebarLink key={l.href} {...l} onClick={() => setOpen(false)} />
              ))}
            </SidebarSection>
          )}

          {!isSuperAdmin && sections.permissionsMenu.length > 0 && (
            <SidebarSection title="My Permissions">
              {sections.permissionsMenu.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-white/80"
                >
                  {p.icon}
                  {p.label}
                </li>
              ))}
            </SidebarSection>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 text-xs text-white/70">
          Signed in as
          <div className="font-medium">{session?.user?.email}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 pt-16 lg:pt-0 p-4 lg:p-8">{children}</main>
    </div>
  );
}

/* ------------------- */
/* Helper Components   */
/* ------------------- */

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs uppercase tracking-wider text-white/60">
        {title}
      </p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function SidebarLink({
  label,
  href,
  icon,
  onClick,
}: {
  label: string;
  href: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="
          flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm font-medium
          hover:bg-white/10 transition
        "
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}

