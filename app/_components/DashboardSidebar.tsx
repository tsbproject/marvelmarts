

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { ReactNode, useMemo, useState } from "react";
// import {
//   LayoutDashboard,
//   Users,
//   Newspaper,
//   ShieldCheck,
//   Package,
//   ShoppingCart,
//   Layers,
//   LifeBuoy,
//   Settings,
//   ChevronDown,
//   Menu,
//   X,
//   Mail,
//   Activity, 
//   StarHalf,
//   Flame
// } from "lucide-react";
// import { SectionLink } from "@/types/dashboard";

// interface DashboardSidebarProps {
//   children?: ReactNode;
//   sections: any;
//   role: string;
//   user?: {
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: string;
//   };
// }

// type EnhancedLink = SectionLink & {
//   hasChildren?: boolean;
//   children?: { label: string; href: string }[];
// };

// export default function DashboardSidebar({ children, sections, role: propRole, user: propUser }: DashboardSidebarProps) {
//   const { data: session } = useSession();
//   const pathname = usePathname();

//   // Use session data but fallback to props if provided
//   const userPermissions = session?.user?.permissions ?? {};
//   const userRole = propRole || session?.user?.role;
//   const isSuperAdmin = userRole === "SUPER_ADMIN";

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [supportOpen, setSupportOpen] = useState(false);

//   const computedSections = useMemo(() => {
//     if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
//       const general: EnhancedLink[] = [
//         {
//           label: "Overview",
//           href: "/dashboard/admins/overview",
//           icon: <LayoutDashboard size={20} />,
//           visible: true,
//         },
//       ];

//       const management: EnhancedLink[] = [
//          {
//           label: "Admins",
//           href: "/dashboard/admins",
//           icon: <ShieldCheck size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageAdmins,
//         },
//         {
//           label: "Activity",
//           href: "/dashboard/admins/activity",
//           icon: <Activity size={20} />,
//           visible: true,
//         },
//         {
//           label: "Reviews",
//           href: "/dashboard/admins/reviews",
//           icon: <StarHalf size={20} />,
//           visible: true, 
//         },
       
//         {
//           label: "Users",
//           href: "/dashboard/admins/users",
//           icon: <Users size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageUsers,
//         },
//         {
//           label: "Blogs",
//           href: "/dashboard/blogs", 
//           icon: <Newspaper size={20} />,
//           visible: isSuperAdmin || (userRole === "ADMIN" && !!userPermissions.manageBlogs),
//         },
//         {
//           label: "Products",
//           href: "/dashboard/admins/products",
//           icon: <Package size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageProducts,
//         },
//         {
//           label: "Trending Gear",
//           href: "/dashboard/admins/trending",
//           icon: <Flame size={20} className="text-orange-500" />,
//           visible: isSuperAdmin || !!userPermissions.manageProducts,
//         },
//         {
//           label: "Orders",
//           href: "/dashboard/admins/orders",
//           icon: <ShoppingCart size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageOrders,
//         },
//         {
//           label: "Categories",
//           href: "/dashboard/admins/categories",
//           icon: <Layers size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageCategories,
//         },
//         {
//           label: "Support",
//           href: "/dashboard/admins/support",
//           icon: <LifeBuoy size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageSupport,
//           hasChildren: true,
//           children: [
//             { label: "Articles", href: "/dashboard/admins/support" },
//             { label: "Tickets", href: "/dashboard/admins/support/tickets" },
//           ],
//         },
//         {
//           label: "Settings",
//           href: "/dashboard/admins/settings",
//           icon: <Settings size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageSettings,
//         },
//         {
//           label: "Subscribers",
//           href: "/dashboard/admins/subscribers",
//           icon: <Mail size={20} />,
//           visible: isSuperAdmin || !!userPermissions.manageSettings,
//         },
//       ];

//       return {
//         general: general.filter((i) => i.visible),
//         management: management.filter((i) => i.visible),
//       };
//     }
    
//     // Default/Fallback logic for non-admin roles
//     return {
//       general: (sections?.general as EnhancedLink[]) ?? [],
//       management: (sections?.management as EnhancedLink[]) ?? [],
//     };
//   }, [userRole, isSuperAdmin, userPermissions, sections]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* ================= DESKTOP SIDEBAR ================= */}
//       <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-gray-950 text-gray-300 border-r border-white/5 h-screen sticky top-0">
//         <div className="px-8 py-8 flex flex-col gap-1">
//           <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
//             MarvelMarts<span className="text-indigo-500">.</span>
//           </h2>
//           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Control Panel</p>
//         </div>

//         <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
//           <div>
//             <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Main</p>
//             <div className="space-y-1">
//               {computedSections.general.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight
//                     ${pathname === link.href ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white/5 hover:text-white"}`}
//                 >
//                   {link.icon}
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           <div>
//             <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Management</p>
//             <div className="space-y-1">
//               {computedSections.management.map((link) => (
//                 <div key={link.label}>
//                   {link.hasChildren ? (
//                     <>
//                       <button
//                         onClick={() => setSupportOpen(!supportOpen)}
//                         className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight hover:bg-white/5 hover:text-white"
//                       >
//                         <div className="flex items-center gap-3">
//                           {link.icon}
//                           {link.label}
//                         </div>
//                         <ChevronDown size={14} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
//                       </button>
//                       {supportOpen && (
//                         <div className="mt-1 ml-9 space-y-1 border-l border-white/10 pl-4">
//                           {link.children?.map((sub) => (
//                             <Link
//                               key={sub.href}
//                               href={sub.href}
//                               className={`block py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors ${pathname === sub.href ? "text-indigo-400" : "text-gray-500"}`}
//                             >
//                               {sub.label}
//                             </Link>
//                           ))}
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <Link
//                       href={link.href}
//                       className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight
//                         ${pathname === link.href ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white/5 hover:text-white"}`}
//                     >
//                       {link.icon}
//                       {link.label}
//                     </Link>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </nav>

//         <div className="p-4 border-t border-white/5 bg-black/20">
//           <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
//             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-xs">
//               {(propUser?.email || session?.user?.email)?.charAt(0).toUpperCase() || "A"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-[10px] font-black text-white uppercase truncate">{propUser?.name || session?.user?.name || "Admin"}</p>
//               <p className="text-[9px] text-gray-500 truncate">{propUser?.email || session?.user?.email}</p>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* ================= CONTENT AREA ================= */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
//           <h2 className="font-black text-xl uppercase tracking-tighter">
//             MarvelMarts<span className="text-indigo-600">.</span>
//           </h2>
//           <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-gray-50 rounded-xl">
//             {mobileOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </header>

//         {mobileOpen && (
//           <div className="lg:hidden fixed inset-0 z-[100] bg-white p-8 animate-in fade-in slide-in-from-top-4">
//             <div className="flex justify-between items-center mb-12">
//               <h2 className="font-black text-2xl tracking-tighter">MENU</h2>
//               <button onClick={() => setMobileOpen(false)} className="p-4 bg-gray-100 rounded-full">
//                 <X />
//               </button>
//             </div>
//             <div className="space-y-6">
//               {computedSections.general.concat(computedSections.management).map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   onClick={() => setMobileOpen(false)}
//                   className="block text-2xl font-black uppercase tracking-tight border-b border-gray-100 pb-4"
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         )}

//         <main className="flex-1">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }





"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  ShieldCheck,
  Package,
  ShoppingCart,
  Layers,
  LifeBuoy,
  Settings,
  ChevronDown,
  Menu,
  X,
  Mail,
  Activity, 
  StarHalf,
  Flame
} from "lucide-react";
import { SectionLink } from "@/types/dashboard";

interface DashboardSidebarProps {
  children?: ReactNode;
  sections: any;
  role: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

type EnhancedLink = SectionLink & {
  hasChildren?: boolean;
  children?: { label: string; href: string }[];
};

export default function DashboardSidebar({ children, sections, role: propRole, user: propUser }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Use session data but fallback to props if provided
  const userPermissions = session?.user?.permissions ?? {};
  const userRole = propRole || session?.user?.role;
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const computedSections = useMemo(() => {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      const general: EnhancedLink[] = [
        {
          label: "Overview",
          href: "/dashboard/admins/overview",
          icon: <LayoutDashboard size={20} />,
          // Overview is usually visible to everyone, but can be locked to manageSettings permission
          visible: isSuperAdmin || !!userPermissions.manageSettings || true, 
        },
      ];

      const management: EnhancedLink[] = [
         {
          label: "Admins",
          href: "/dashboard/admins",
          icon: <ShieldCheck size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageAdmins,
        },
        {
          label: "Activity",
          href: "/dashboard/admins/activity",
          icon: <Activity size={20} />,
          // Linked to manageUsers or manageAdmins usually
          visible: isSuperAdmin || !!userPermissions.manageUsers || !!userPermissions.manageAdmins,
        },
        {
          label: "Reviews",
          href: "/dashboard/admins/reviews",
          icon: <StarHalf size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageProducts, 
        },
       
        {
          label: "Users",
          href: "/dashboard/admins/users",
          icon: <Users size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageUsers,
        },
        {
          label: "Blogs",
          href: "/dashboard/blogs", 
          icon: <Newspaper size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageBlogs,
        },
        {
          label: "Products",
          href: "/dashboard/admins/products",
          icon: <Package size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageProducts,
        },
        {
          label: "Trending Gear",
          href: "/dashboard/admins/trending",
          icon: <Flame size={20} className="text-orange-500" />,
          visible: isSuperAdmin || !!userPermissions.manageProducts,
        },
        {
          label: "Orders",
          href: "/dashboard/admins/orders",
          icon: <ShoppingCart size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageOrders,
        },
        {
          label: "Categories",
          href: "/dashboard/admins/categories",
          icon: <Layers size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageCategories,
        },
        {
          label: "Support",
          href: "/dashboard/admins/support",
          icon: <LifeBuoy size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageSupport,
          hasChildren: true,
          children: [
            { label: "Articles", href: "/dashboard/admins/support" },
            { label: "Tickets", href: "/dashboard/admins/support/tickets" },
          ],
        },
        {
          label: "Settings",
          href: "/dashboard/admins/settings",
          icon: <Settings size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageSettings,
        },
        {
          label: "Subscribers",
          href: "/dashboard/admins/subscribers",
          icon: <Mail size={20} />,
          visible: isSuperAdmin || !!userPermissions.manageSettings,
        },
      ];

      return {
        general: general.filter((i) => i.visible),
        management: management.filter((i) => i.visible),
      };
    }
    
    // Default/Fallback logic for non-admin roles
    return {
      general: (sections?.general as EnhancedLink[]) ?? [],
      management: (sections?.management as EnhancedLink[]) ?? [],
    };
  }, [userRole, isSuperAdmin, userPermissions, sections]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-gray-950 text-gray-300 border-r border-white/5 h-screen sticky top-0">
        <div className="px-8 py-8 flex flex-col gap-1">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
            MarvelMarts<span className="text-indigo-500">.</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Control Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {computedSections.general.length > 0 && (
            <div>
              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Main</p>
              <div className="space-y-1">
                {computedSections.general.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight
                      ${pathname === link.href ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white/5 hover:text-white"}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {computedSections.management.length > 0 && (
            <div>
              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Management</p>
              <div className="space-y-1">
                {computedSections.management.map((link) => (
                  <div key={link.label}>
                    {link.hasChildren ? (
                      <>
                        <button
                          onClick={() => setSupportOpen(!supportOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight hover:bg-white/5 hover:text-white"
                        >
                          <div className="flex items-center gap-3">
                            {link.icon}
                            {link.label}
                          </div>
                          <ChevronDown size={14} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
                        </button>
                        {supportOpen && (
                          <div className="mt-1 ml-9 space-y-1 border-l border-white/10 pl-4">
                            {link.children?.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`block py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors ${pathname === sub.href ? "text-indigo-400" : "text-gray-500"}`}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-tight
                          ${pathname === link.href ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white/5 hover:text-white"}`}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-xs">
              {(propUser?.email || session?.user?.email)?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white uppercase truncate">{propUser?.name || session?.user?.name || "Admin"}</p>
              <p className="text-[9px] text-gray-500 truncate">{propUser?.email || session?.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="font-black text-xl uppercase tracking-tighter">
            MarvelMarts<span className="text-indigo-600">.</span>
          </h2>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-gray-50 rounded-xl">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] bg-white p-8 animate-in fade-in slide-in-from-top-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-black text-2xl tracking-tighter">MENU</h2>
              <button onClick={() => setMobileOpen(false)} className="p-4 bg-gray-100 rounded-full">
                <X />
              </button>
            </div>
            <div className="space-y-6">
              {computedSections.general.concat(computedSections.management).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-2xl font-black uppercase tracking-tight border-b border-gray-100 pb-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}