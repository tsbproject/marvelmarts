



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ReactNode,
  useMemo,
  useState,
  memo,
  useEffect,
} from "react";

import { getPusherClient } from "@/app/lib/pusherClient";

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
  Store,
  Mail,
  Activity,
  StarHalf,
  Flame,
  Heart,
  CreditCard,
  MessageCircle,
  Lock,
  BarChart3,
  MessageSquareMore, 
  Headset, 
  HelpCircle,
} from "lucide-react";

import { SectionLink } from "@/types/dashboard";

interface DashboardSidebarProps {
  children?: ReactNode;
  sections: any;
   roles:
    | "CUSTOMER"
    | "VENDOR"
    | "ADMIN"
    | "SUPER_ADMIN";
  user?: any;
  permissions?: Record<string, boolean> | null;
  vendorLocked?: boolean;
}

type EnhancedLink = SectionLink & {
  hasChildren?: boolean;
  children?: {
    label: string;
    href: string;
    icon?: ReactNode;
  }[];
  locked?: boolean;
};

const DashboardSidebar = memo(
  ({
    sections,
    roles: dashboardMode,
    user: propUser,
    permissions,
    vendorLocked = false,
  }: DashboardSidebarProps) => {
    const pathname = usePathname();

    const { data: session } = useSession();

    const userRole =
      session?.user?.role ||
      propUser?.role ||
      "CUSTOMER";

    const isSuperAdmin = userRole === "SUPER_ADMIN";

    const isAdmin =
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN";

    const userPermissions =
      permissions ??
      propUser?.permissions ??
      {};

    const pusherClient = getPusherClient();

    const [unreadCount, setUnreadCount] =
      useState(0);

    const [openDropdowns, setOpenDropdowns] =
      useState<Record<string, boolean>>({});

    // ─────────────────────────────────────
    // SUPPORT NOTIFICATIONS
    // ─────────────────────────────────────
    useEffect(() => {
      if (isAdmin || isSuperAdmin) {
        const channel = pusherClient.subscribe(
          "global-admin-channel"
        );

        channel.bind(
          "new-support-ticket",
          () => {
            if (
              !pathname.includes(
                "/support/live"
              )
            ) {
              setUnreadCount(
                (prev) => prev + 1
              );
            }
          }
        );

        return () => {
          pusherClient.unsubscribe(
            "global-admin-channel"
          );
        };
      }
    }, [
      isAdmin,
      isSuperAdmin,
      pathname,
      pusherClient,
    ]);

    useEffect(() => {
      if (
        pathname.includes("/support/live")
      ) {
        setUnreadCount(0);
      }
    }, [pathname]);

    // ─────────────────────────────────────
    // DROPDOWN TOGGLE
    // ─────────────────────────────────────
    const toggleDropdown = (
      label: string
    ) => {
      setOpenDropdowns((prev) => ({
        ...prev,
        [label]: !prev[label],
      }));
    };

    // ─────────────────────────────────────
    // SECTIONS
    // ─────────────────────────────────────
    const computedSections = useMemo(() => {
      const safeSections = sections || {
        general: [],
        management: [],
      };

      const hasPerm = (
        key: keyof typeof userPermissions
      ) =>
        isSuperAdmin ||
        userPermissions?.[key] === true;

      // ─────────────────────────────────────
      // CUSTOMER SIDEBAR
      // ─────────────────────────────────────
      if (dashboardMode === "CUSTOMER") {
        return {
          general: [
            {
              label: "My Dashboard",
              href: "/account/customer",
              icon: (
                <LayoutDashboard size={20} />
              ),
              visible: true,
            },

            {
              label: "My Orders",
              href:
                "/account/customer/orders",
              icon: (
                <ShoppingCart size={20} />
              ),
              visible: true,
            },

            {
              label: "Wishlist",
              href:
                "/account/customer/wishlist",
              icon: <Heart size={20} />,
              visible: true,
            },
          ],

          management: [
            {
              label: "Settings",
              href:
                "/account/customer/profile-settings",
              icon: <Settings size={20} />,
              visible: true,
            },

            {
              label: "Payment method",
              href:
                "/account/customer/payment-methods",
              icon: (
                <CreditCard size={20} />
              ),
              visible: true,
            },

            {
              label: "Bank details",
              href:
                "/account/customer/bank-details",
              icon: (
                <CreditCard size={20} />
              ),
              visible: true,
            },
          ],
        };
      }

      // ─────────────────────────────────────
      // VENDOR SIDEBAR
      // ─────────────────────────────────────
      if (dashboardMode === "VENDOR") {
        const general: EnhancedLink[] = [
          {
            label: "Vendor Dashboard",
            href: "/account/vendor",
            icon: (
              <LayoutDashboard size={20} />
            ),
            visible: true,
          },

          {
            label: "My Products",
            href:
              "/account/vendor/products",
            icon: <Package size={20} />,
            visible: true,
          },

          {
            label: "Buy Credit Boost",
            href:
              "/account/vendor/credit-boost",
            icon: <Package size={20} />,
            visible: true,
          },
        ];

        const management: EnhancedLink[] =
          [
            {
              label: "Store Orders",
              href:
                "/account/vendor/orders",
              icon: (
                <ShoppingCart size={20} />
              ),
              visible: true,
            },

            {
              label: "Store Settings",
              href:
                "/account/vendor/store-settings",
              icon: (
                <Settings size={20} />
              ),
              visible: true,
            },

            {
              label: "Wallet and Payout",
              href:
                "/account/vendor/payouts",
              icon: (
                <Settings size={20} />
              ),
              visible: true,
            },

            {
              label: "Live Chat",
              href:
                "/account/vendor/messages",
              icon: (
                <MessageCircle size={20} />
              ),
              visible: true,
            },

            {
              label: "Analytics",
              href:
                "/account/vendor/analytics",
              icon: (
                <BarChart3 size={20} />
              ),
              visible: true,
            },

            {
              label: "Help & Support",
              href:
                "/account/vendor/help-&-support",
              icon: (
                <HelpCircle size={20} />
              ),
              visible: true,
            },
          ];

        if (vendorLocked) {
          [...general, ...management].forEach(
            (item) => {
              item.locked = true;
            }
          );
        }

        return {
          general,
          management,
        };
      }

      // ─────────────────────────────────────
      // ADMIN SIDEBAR
      // ─────────────────────────────────────
      if (
        dashboardMode === "ADMIN"
      ) {
        const general: EnhancedLink[] =
          [
            {
              label: "Overview",
              href:
                "/dashboard/admins/overview",
              icon: (
                <LayoutDashboard size={20} />
              ),
              visible: true,
            },
          ];

        const management: EnhancedLink[] =
          [
            {
              label: "Admins",
              href:
                "/dashboard/admins",
              icon: (
                <ShieldCheck size={20} />
              ),
              visible:
                isSuperAdmin ||
                userPermissions.manageAdmins ===
                  true,
            },

            {
              label: "Activity",
              href:
                "/dashboard/admins/activity",
              icon: (
                <Activity size={20} />
              ),
              visible:
                isSuperAdmin ||
                userPermissions.manageActivity ===
                  true,
            },

            {
              label: "Vendors",
              href:
                "/dashboard/admins/vendors",
              icon: <Store size={20} />,
              visible:
                isSuperAdmin ||
                userPermissions.manageVendors ===
                  true,
            },

            {
              label: "Users",
              href:
                "/dashboard/admins/users",
              icon: <Users size={20} />,
              visible:
                isSuperAdmin ||
                userPermissions.manageUsers ===
                  true,
            },

            {
              label: "Products",
              href:
                "/dashboard/admins/products",
              icon: (
                <Package size={20} />
              ),
              visible:
                isSuperAdmin ||
                userPermissions.manageProducts ===
                  true,
            },

            {
              label: "Orders",
              href:
                "/dashboard/admins/orders",
              icon: (
                <ShoppingCart size={20} />
              ),
              visible:
                isSuperAdmin ||
                userPermissions.manageOrders ===
                  true,
            },

            {
              label: "Categories",
              href:
                "/dashboard/admins/categories",
              icon: <Layers size={20} />,
              visible:
                isSuperAdmin ||
                userPermissions.manageCategories ===
                  true,
            },

            {
              label: "Support",
              href:
                "/dashboard/admins/support",
              icon: (
                <LifeBuoy size={20} />
              ),
              visible:
                hasPerm(
                  "manageSupport"
                ),
              hasChildren: true,

              children: [
                {
                  label: "Articles",
                  href:
                    "/dashboard/admins/support/articles",
                  icon: (
                    <LifeBuoy size={16} />
                  ),
                },

                {
                  label: "Tickets",
                  href:
                    "/dashboard/admins/support/tickets",
                  icon: (
                    <LifeBuoy size={16} />
                  ),
                },

                {
                  label: "Live Chat",
                  href:
                    "/dashboard/admins/support/messages",
                  icon: (
                    <MessageCircle size={16} />
                  ),
                },
              ],
            },

            {
              label: "Settings",
              href:
                "/dashboard/admins/settings",
              icon: (
                <Settings size={20} />
              ),
              visible:
                isSuperAdmin ||
                userPermissions.manageSettings ===
                  true,
            },
          ];

        return {
          general: general.filter(
            (i) => i.visible
          ),

          management:
            management.filter(
              (i) => i.visible
            ),
        };
      }

      return safeSections;
    }, [
      dashboardMode,
      isAdmin,
      isSuperAdmin,
      userPermissions,
      sections,
      vendorLocked,
    ]);

    // ─────────────────────────────────────
    // RENDER LINKS
    // ─────────────────────────────────────
    const renderLink = (
      link: EnhancedLink
    ) => {
      const isActive =
        pathname === link.href;

      const isLocked = !!link.locked;

      if (link.hasChildren) {
        const open =
          openDropdowns[link.label];

        return (
          <div key={link.label}>
            <button
              onClick={() =>
                toggleDropdown(
                  link.label
                )
              }
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-[9px] uppercase tracking-tight hover:bg-white/5 hover:text-white group"
            >
              <div className="flex items-center gap-3 relative">
                {link.icon}

                {link.label}

                {unreadCount > 0 &&
                  link.label ===
                    "Support" && (
                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
              </div>

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  open
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {open && (
              <div className="mt-1 ml-9 space-y-1 border-l border-white/10 pl-4">
                {link.children?.map(
                  (child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-tight hover:text-white transition-colors
                    ${
                      pathname ===
                      child.href
                        ? "text-indigo-400"
                        : "text-gray-500"
                    }`}
                    >
                      {child.icon}
                      {child.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={link.href}
          href={
            isLocked
              ? "#"
              : link.href
          }
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[9px] uppercase tracking-tight
          ${
            isActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "hover:bg-white/5 hover:text-white"
          }
          ${
            isLocked
              ? "pointer-events-none opacity-50"
              : ""
          }`}
          title={
            isLocked
              ? "Locked until verification approved"
              : ""
          }
        >
          {isLocked && (
            <Lock
              size={16}
              className="text-red-500"
            />
          )}

          {link.icon}

          {link.label}
        </Link>
      );
    };

    return (
      <aside className="hidden lg:flex lg:flex-col lg:w-72 2xl:w-60 bg-gray-950 text-gray-300 border-r border-white/5 sticky top-0 h-screen">
        {/* HEADER */}
        <div className="px-8 py-8 flex flex-col gap-1">
          <img
            src="/logo1-white.png"
            alt="Marvelmarts logo"
            width={100}
            height={60}
            className="object-contain w-60"
          />

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            {dashboardMode ===
            "CUSTOMER"
              ? "My Account"
              : dashboardMode ===
                "ADMIN"
              ? "Control Panel"
              : "Vendor Suite"}
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {computedSections.general
            .length > 0 && (
            <div>
              <p className="px-4 text-[13px] font-black uppercase tracking-widest text-gray-600 mb-4">
                Main
              </p>

              <div className="space-y-1">
                {computedSections.general.map(
                  renderLink
                )}
              </div>
            </div>
          )}

          {computedSections.management
            .length > 0 && (
            <div>
              <p className="px-4 text-[13px] font-black uppercase tracking-widest text-gray-600 mb-4">
                Management
              </p>

              <div className="space-y-1">
                {computedSections.management.map(
                  renderLink
                )}
              </div>
            </div>
          )}
        </nav>

        {/* USER */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-lg">
              {propUser?.email
                ?.charAt(0)
                .toUpperCase() || "A"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white uppercase truncate">
                {propUser?.name ||
                  "User"}
              </p>

              <p className="text-[9px] text-gray-500 truncate">
                {propUser?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    );
  }
);

DashboardSidebar.displayName =
  "DashboardSidebar";

export default DashboardSidebar;