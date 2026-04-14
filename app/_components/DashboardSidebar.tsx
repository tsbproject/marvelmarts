



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, useState, memo, useEffect } from "react"; 
import { pusherClient } from "@/app/lib/pusherClient"; 
import {
  LayoutDashboard, Users, Newspaper, ShieldCheck, Package, ShoppingCart, Layers,
  LifeBuoy, Settings, ChevronDown, Store, Mail, Activity, StarHalf,
  Flame, ArrowLeftRight, Heart, MapPin, DownloadIcon, CreditCard, MessageCircle, Lock
} from "lucide-react";
import { SectionLink } from "@/types/dashboard";

interface DashboardSidebarProps {
  children?: ReactNode;
  sections: any;
  role: string;
  user?: any;
  permissions?: Record<string, boolean> | null; 
  roles: "VENDOR" | "CUSTOMER";
  vendorLocked?: boolean; 
}

type EnhancedLink = SectionLink & {
  hasChildren?: boolean;
  children?: { label: string; href: string; icon?: ReactNode }[];
  locked?: boolean; 

};

const DashboardSidebar = memo(({ children, sections, role: propRole, user: propUser, permissions, vendorLocked = false }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const userRole = propRole || propUser?.role || "CUSTOMER";
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdmin = userRole === "ADMIN";
  const userPermissions = permissions ?? propUser?.permissions ?? {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [activeView, setActiveView] = useState<"ADMIN" | "VENDOR">(
    isSuperAdmin || isAdmin ? "ADMIN" : "VENDOR"
  );

  // ── NOTIFICATION STATE ──
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      const channel = pusherClient.subscribe("global-admin-channel");

      channel.bind("new-support-ticket", () => {
        if (!pathname.includes("/support/live")) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        pusherClient.unsubscribe("global-admin-channel");
      };
    }
  }, [isAdmin, isSuperAdmin, pathname]);

  useEffect(() => {
    if (pathname.includes("/support/live")) {
      setUnreadCount(0);
    }
  }, [pathname]);

  const computedSections = useMemo(() => {
    const safeSections = sections || { general: [], management: [] };

    const hasPerm = (key: keyof typeof userPermissions) =>
  isSuperAdmin || userPermissions?.[key] === true;

    // ── CUSTOMER MODE ──
    if (userRole === "CUSTOMER" || userRole === "USER") {
      return {
        general: [
          { label: "My Dashboard", href: "/account/customer", icon: <LayoutDashboard size={20} />, visible: true },
          { label: "My Orders", href: "/account/customer/orders", icon: <ShoppingCart size={20} />, visible: true },
          { label: "Wishlist", href: "/account/customer/wishlist", icon: <Heart size={20} />, visible: true },
        ],
        management: [
          // { label: "Addresses", href: "/account/customer/profile", icon: <MapPin size={20} />, visible: true },
          { label: "Settings", href: "/account/customer/profile-settings", icon: <Settings size={20} />, visible: true },
          // { label: "Downloads", href: "/account/customer/downloads", icon: <DownloadIcon size={20} />, visible: true },
          { label: "Payment method", href: "/account/customer/payment-methods", icon: <CreditCard size={20} />, visible: true },
          { label: "Bank details", href: "/account/customer/bank-details", icon: <CreditCard size={20} />, visible: true },
        ]
      };
    }

    // ── VENDOR MODE ──
    if (activeView === "VENDOR") {
      const general: EnhancedLink[] = [
        { label: "Vendor Dashboard", href: "/account/vendor", icon: <LayoutDashboard size={20} />, visible: true },
        { label: "My Products", href: "/account/vendor/products", icon: <Package size={20} />, visible: true },
        { label: "Buy Credit Boost", href: "/account/vendor/credit-boost", icon: <Package size={20} />, visible: true },
      ];

      const management: EnhancedLink[] = [
        { label: "Store Orders", href: "/account/vendor/orders", icon: <ShoppingCart size={20} />, visible: true },
        { label: "Store Settings", href: "/account/vendor/store-settings", icon: <Settings size={20} />, visible: true },
        { label: "Wallet and Payout", href: "/account/vendor/payouts", icon: <Settings size={20} />, visible: true },
        { label: "Live Chat", href: "/account/vendor/messages", icon: <MessageCircle size={20} />, visible: true },
      ];

      if (vendorLocked) {
        [...general, ...management].forEach(item => item.locked = true);
      }

      return { general, management };
    }

    // ── ADMIN / SUPER_ADMIN MODE ──
    if (isAdmin || isSuperAdmin) {
      const general: EnhancedLink[] = [
        { label: "Overview", href: "/dashboard/admins/overview", icon: <LayoutDashboard size={20} />, visible: true },
      ];

      const management: EnhancedLink[] = [
        { label: "Admins", href: "/dashboard/admins", icon: <ShieldCheck size={20} />, visible: isSuperAdmin || userPermissions.manageAdmins === true },
        { label: "Activity", href: "/dashboard/admins/activity", icon: <Activity size={20} />, visible: isSuperAdmin || userPermissions.manageActivity === true },
        { label: "Treasury History", href: "/dashboard/admins/treasury", icon: <Activity size={20} />, visible: isSuperAdmin || userPermissions.manageTreasury === true },
        { label: "Reviews", href: "/dashboard/admins/reviews", icon: <StarHalf size={20} />, visible: isSuperAdmin || userPermissions.manageReviews === true },
        { label: "Vendors", href: "/dashboard/admins/vendors", icon: <Store size={20} />, visible: isSuperAdmin || userPermissions.manageVendors === true },
        { label: "Vendors Payout", href: "/dashboard/admins/vendorspayout", icon: <Store size={20} />, visible: isSuperAdmin || userPermissions.manageVendorspayout === true },
        // { label: "Verifications", href: "/dashboard/admins/verifications", icon: <Store size={20} />, visible: isSuperAdmin || userPermissions.manageVerifications === true },
        { label: "Users", href: "/dashboard/admins/users", icon: <Users size={20} />, visible: isSuperAdmin || userPermissions.manageUsers === true },
        { label: "Blogs", href: "/dashboard/blogs", icon: <Newspaper size={20} />, visible: isSuperAdmin || userPermissions.manageBlogs === true },
        { label: "Products", href: "/dashboard/admins/products", icon: <Package size={20} />, visible: isSuperAdmin || userPermissions.manageProducts === true },
        { label: "Trending Products", href: "/dashboard/admins/trending", icon: <Flame size={20} className="text-orange-500" />, visible: isSuperAdmin || userPermissions.manageTrending === true },
        { label: "Orders", href: "/dashboard/admins/orders", icon: <ShoppingCart size={20} />, visible: isSuperAdmin || userPermissions.manageOrders === true },
        { label: "Categories", href: "/dashboard/admins/categories", icon: <Layers size={20} />, visible: isSuperAdmin || userPermissions.manageCategories === true },

        // ── Support Dropdown ──
        {
          label: "Support",
          href: "/dashboard/admins/support",
          icon: <LifeBuoy size={20} />,
          visible: hasPerm("manageSupport"),
          hasChildren: true,
          children: [
            { label: "Articles", href: "/dashboard/admins/support/articles", icon: <LifeBuoy size={16} /> },
            { label: "Create Article", href: "/dashboard/admins/support/articles/new", icon: <LifeBuoy size={16} /> },
            { label: "Tickets",   href: "/dashboard/admins/support/tickets",   icon: <LifeBuoy size={16} /> },
            { label: "Refunds",   href: "/dashboard/admins/support/refunds",   icon: <LifeBuoy size={16} /> },
            { label: "Live Chat", href: "/dashboard/admins/support/messages",  icon: <MessageCircle size={16} /> },
          ],
        },
        
        { label: "Settings", href: "/dashboard/admins/settings", icon: <Settings size={20} />, visible: isSuperAdmin || userPermissions.manageSettings === true },
        { label: "Subscribers", href: "/dashboard/admins/subscribers", icon: <Mail size={20} />, visible: isSuperAdmin || userPermissions.manageSubscribers === true },
      ];

      return {
        general: general.filter(i => i.visible),
        management: management.filter(i => i.visible),
      };
    }

    // fallback
    return safeSections;
  }, [userRole, isAdmin, isSuperAdmin, userPermissions, sections, activeView, vendorLocked]);

  // ── RENDER FUNCTION WITH LOCK HANDLING & DROPDOWN ──
  const renderLink = (link: EnhancedLink) => {
    const isActive = pathname === link.href;
    const isLocked = !!link.locked;

    if (link.hasChildren) {
      const [open, setOpen] = useState(false);

      return (
        <div key={link.label}>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-[9px] uppercase tracking-tight hover:bg-white/5 hover:text-white group"
          >
            <div className="flex items-center gap-3 relative">
              {link.icon}
              {link.label}
              {unreadCount > 0 && link.label === "Support" && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="mt-1 ml-9 space-y-1 border-l border-white/10 pl-4">
              {link.children?.map(child => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-tight hover:text-white transition-colors
                    ${pathname === child.href ? "text-indigo-400" : "text-gray-500"}`}
                >
                  {child.icon}
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={link.href}
        href={isLocked ? "#" : link.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[9px] uppercase tracking-tight
          ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white/5 hover:text-white"}
          ${isLocked ? "pointer-events-none opacity-50" : ""}`}
        title={isLocked ? "Locked until verification approved" : ""}
      >
        {isLocked && <Lock size={16} className="text-red-500" />}
        {link.icon}
        {link.label}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 2xl:w-60 bg-gray-950 text-gray-300 border-r border-white/5 sticky top-0 h-screen">
      <div className="px-8 py-8 flex flex-col gap-1">
        <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">
          MarvelMarts<span className="text-indigo-500">.</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          {userRole === "CUSTOMER" || userRole === "USER" ? "My Account" : (activeView === "ADMIN" ? "Control Panel" : "Vendor Suite")}
        </p>
      </div>

      {isSuperAdmin && (
        <div className="px-4 mb-6">
          <button 
            onClick={() => setActiveView(prev => prev === "ADMIN" ? "VENDOR" : "ADMIN")}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all group"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Switch Mode</span>
              <span className="text-lg font-bold text-white uppercase">{activeView}</span>
            </div>
            <ArrowLeftRight size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {computedSections.general.length > 0 && (
          <div>
            <p className="px-4 text-[13px] font-black uppercase tracking-widest text-gray-600 mb-4">Main</p>
            <div className="space-y-1">
              {computedSections.general.map(renderLink)}
            </div>
          </div>
        )}

        {computedSections.management.length > 0 && (
          <div>
            <p className="px-4 text-[13px] font-black uppercase tracking-widest text-gray-600 mb-4">Management</p>
            <div className="space-y-1">
              {computedSections.management.map(renderLink)}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-lg ">
            {propUser?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white uppercase truncate">{propUser?.name || "User"}</p>
            <p className="text-[9px] text-gray-500 truncate">{propUser?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";
export default DashboardSidebar;