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
  Package,
  ShoppingCart,
  Heart,
  CreditCard,
  Settings,
  MessageCircle,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Megaphone,
  Lock,
} from "lucide-react";

import { SectionLink } from "@/types/dashboard";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DashboardRole =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "VENDOR"
  | "CUSTOMER";

interface DashboardSidebarProps {
  children?: ReactNode;

  sections?: {
    general?: EnhancedLink[];
    management?: EnhancedLink[];

    // Admin grouped sections
    administration?: EnhancedLink[];
    marketplace?: EnhancedLink[];
    vendors?: EnhancedLink[];
    content?: EnhancedLink[];
    support?: EnhancedLink[];
    system?: EnhancedLink[];
  };

  role: DashboardRole;

  user?: any;

  permissions?: Record<string, boolean> | null;

  vendorLocked?: boolean;
}

type EnhancedLink =
  SectionLink & {
    visible?: boolean;

    hasChildren?: boolean;

    children?: {
      label: string;
      href: string;
      icon?: ReactNode;
    }[];

    locked?: boolean;
  };

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

const DashboardSidebar = memo(
  ({
    sections,
    role: dashboardMode,
    user: propUser,
    vendorLocked = false,
  }: DashboardSidebarProps) => {
    const pathname = usePathname();

    const { data: session } = useSession();

    const pusherClient = useMemo(
      () => getPusherClient(),
      []
    );

    const [unreadCount, setUnreadCount] =
      useState(0);

    const [openDropdowns, setOpenDropdowns] =
      useState<Record<string, boolean>>({});

    /* ---------------------------------------------------------------------- */
    /*                              ROLE STATE                                */
    /* ---------------------------------------------------------------------- */

    const sessionRoles =
      session?.user?.roles ?? [];

    const sessionRole =
      session?.user?.role;

    const propRoles =
      propUser?.roles ?? [];

    const propRole =
      propUser?.role;

    const isSuperAdmin =
      sessionRole === "SUPER_ADMIN" ||
      sessionRoles.includes("SUPER_ADMIN") ||
      propRole === "SUPER_ADMIN" ||
      propRoles.includes("SUPER_ADMIN");

    const isAdmin =
      isSuperAdmin ||
      sessionRole === "ADMIN" ||
      sessionRoles.includes("ADMIN") ||
      propRole === "ADMIN" ||
      propRoles.includes("ADMIN");

    /* ---------------------------------------------------------------------- */
    /*                         SUPPORT NOTIFICATIONS                           */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
      if (!isAdmin) {
        return;
      }

      const channel =
        pusherClient.subscribe(
          "global-admin-channel"
        );

      const handleSupportTicket = () => {
        if (
          !pathname.includes(
            "/support/"
          )
        ) {
          setUnreadCount(
            (prev) => prev + 1
          );
        }
      };

      channel.bind(
        "new-support-ticket",
        handleSupportTicket
      );

      return () => {
        channel.unbind(
          "new-support-ticket",
          handleSupportTicket
        );

        pusherClient.unsubscribe(
          "global-admin-channel"
        );
      };
    }, [
      isAdmin,
      pathname,
      pusherClient,
    ]);

    useEffect(() => {
      if (
        pathname.includes(
          "/support/"
        )
      ) {
        setUnreadCount(0);
      }
    }, [pathname]);

    /* ---------------------------------------------------------------------- */
    /*                           DROPDOWN STATE                                */
    /* ---------------------------------------------------------------------- */

    const toggleDropdown = (
      label: string
    ) => {
      setOpenDropdowns(
        (prev) => ({
          ...prev,

          [label]:
            !prev[label],
        })
      );
    };

    /* ---------------------------------------------------------------------- */
    /*                        COMPUTED SIDEBAR SECTIONS                        */
    /* ---------------------------------------------------------------------- */

    const computedSections =
      useMemo(() => {
        /*
         * ADMIN / SUPER ADMIN
         *
         * AdminLayoutClient is the source of truth
         * for admin navigation.
         *
         * It already filters navigation according
         * to the permissions assigned by SUPER_ADMIN.
         *
         * DO NOT rebuild admin permissions here.
         */
        if (
          dashboardMode === "ADMIN" ||
          dashboardMode ===
            "SUPER_ADMIN"
        ) {
          return {
            general:
              sections?.general ?? [],

            administration:
              sections?.administration ??
              [],

            marketplace:
              sections?.marketplace ?? [],

            vendors:
              sections?.vendors ?? [],

            content:
              sections?.content ?? [],

            support:
              sections?.support ?? [],

            system:
              sections?.system ?? [],

            management: [],
          };
        }

        /*
         * CUSTOMER
         */

        if (
          dashboardMode === "CUSTOMER"
        ) {
          return {
            general: [
              {
                label: "My Dashboard",

                href:
                  "/account/customer",

                icon: (
                  <LayoutDashboard
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label: "My Orders",

                href:
                  "/account/customer/orders",

                icon: (
                  <ShoppingCart
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label: "Wishlist",

                href:
                  "/account/customer/wishlist",

                icon: (
                  <Heart size={20} />
                ),

                visible: true,
              },
            ] as EnhancedLink[],

            management: [
              {
                label: "Settings",

                href:
                  "/account/customer/profile-settings",

                icon: (
                  <Settings size={20} />
                ),

                visible: true,
              },

              {
              label: "Broadcast",
              href: "/account/customer/communications",
              icon: <Megaphone size={16} />,
              visible: true,
              },


              {
                label:
                  "Payment method",

                href:
                  "/account/customer/payment-methods",

                icon: (
                  <CreditCard
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label: "Bank details",

                href:
                  "/account/customer/bank-details",

                icon: (
                  <CreditCard
                    size={20}
                  />
                ),

                visible: true,
              },
            ] as EnhancedLink[],

            administration: [],
            marketplace: [],
            vendors: [],
            content: [],
            support: [],
            system: [],
          };
        }

        /*
         * VENDOR
         */

        if (
          dashboardMode === "VENDOR"
        ) {
          const general: EnhancedLink[] =
            [
              {
                label:
                  "Vendor Dashboard",

                href:
                  "/account/vendor",

                icon: (
                  <LayoutDashboard
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label:
                  "My Products",

                href:
                  "/account/vendor/products",

                icon: (
                  <Package size={20} />
                ),

                visible: true,
              },

              {
                label:
                  "Buy Credit Boost",

                href:
                  "/account/vendor/credit-boost",

                icon: (
                  <Package size={20} />
                ),

                visible: true,
              },
            ];

          const management: EnhancedLink[] =
            [
              {
                label:
                  "Store Orders",

                href:
                  "/account/vendor/orders",

                icon: (
                  <ShoppingCart
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label:
                  "Store Settings",

                href:
                  "/account/vendor/store-settings",

                icon: (
                  <Settings size={20} />
                ),

                visible: true,
              },

              {
                label:
                  "Wallet and Payout",

                href:
                  "/account/vendor/payouts",

                icon: (
                  <CreditCard
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label: "Live Chat",

                href:
                  "/account/vendor/messages",

                icon: (
                  <MessageCircle
                    size={20}
                  />
                ),

                visible: true,
              },

              {
                label: "Analytics",

                href:
                  "/account/vendor/analytics",

                icon: (
                  <BarChart3
                    size={20}
                  />
                ),

                visible: true,
              },

              {
              label: "Broadcast",

              href: "/account/vendor/communications",

              icon: <Megaphone size={16} />,

              visible: true,
              },


              {
                label:
                  "Help & Support",

                href:
                  "/account/vendor/help-&-support",

                icon: (
                  <HelpCircle
                    size={20}
                  />
                ),

                visible: true,
              },
            ];

          if (vendorLocked) {
            [
              ...general,
              ...management,
            ].forEach(
              (item) => {
                item.locked = true;
              }
            );
          }

          return {
            general,
            management,

            administration: [],
            marketplace: [],
            vendors: [],
            content: [],
            support: [],
            system: [],
          };
        }

        return {
          general:
            sections?.general ?? [],

          management:
            sections?.management ?? [],

          administration:
            sections?.administration ??
            [],

          marketplace:
            sections?.marketplace ?? [],

          vendors:
            sections?.vendors ?? [],

          content:
            sections?.content ?? [],

          support:
            sections?.support ?? [],

          system:
            sections?.system ?? [],
        };
      }, [
        dashboardMode,
        sections,
        vendorLocked,
      ]);

    /* ---------------------------------------------------------------------- */
    /*                              ACTIVE LINK                               */
    /* ---------------------------------------------------------------------- */

    const isLinkActive = (
      href: string
    ) => {
      if (
        href ===
          "/account/vendor" ||
        href ===
          "/account/customer" ||
        href ===
          "/dashboard/admins/overview"
      ) {
        return pathname === href;
      }

      return (
        pathname === href ||
        pathname.startsWith(
          `${href}/`
        )
      );
    };

    /* ---------------------------------------------------------------------- */
    /*                             RENDER LINK                                 */
    /* ---------------------------------------------------------------------- */

    const renderLink = (
      link: EnhancedLink
    ) => {
      const isActive =
        isLinkActive(link.href);

      const isLocked =
        !!link.locked;

      /*
       * DROPDOWN
       */

      if (
        link.hasChildren &&
        link.children?.length
      ) {
        const childActive =
          link.children.some(
            (child) =>
              isLinkActive(
                child.href
              )
          );

        const open =
          openDropdowns[
            link.label
          ] ??
          childActive;

        return (
          <div key={link.label}>
            <button
              type="button"
              onClick={() =>
                toggleDropdown(
                  link.label
                )
              }
              className={`
                w-full
                flex items-center
                justify-between
                px-4 py-3
                rounded-xl
                transition-all
                font-bold
                text-[9px]
                uppercase
                tracking-tight

                ${
                  childActive
                    ? "bg-white/5 text-white"
                    : "hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  relative
                "
              >
                {link.icon}

                <span>
                  {link.label}
                </span>

                {unreadCount > 0 &&
                  link.label ===
                    "Support" && (
                    <span
                      className="
                        absolute
                        -top-2
                        -right-4
                        flex
                        min-w-4
                        h-4
                        px-1
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        text-[8px]
                        font-black
                        text-white
                        animate-pulse
                      "
                    >
                      {unreadCount}
                    </span>
                  )}
              </div>

              <ChevronDown
                size={14}
                className={`
                  transition-transform
                  duration-200

                  ${
                    open
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {open && (
              <div
                className="
                  mt-1
                  ml-9
                  space-y-1
                  border-l
                  border-white/10
                  pl-4
                "
              >
                {link.children.map(
                  (child) => {
                    const active =
                      isLinkActive(
                        child.href
                      );

                    return (
                      <Link
                        key={
                          child.href
                        }
                        href={
                          child.href
                        }
                        className={`
                          flex
                          items-center
                          gap-3
                          px-4
                          py-2.5
                          rounded-lg
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-tight
                          transition-all

                          ${
                            active
                              ? "text-indigo-400 bg-indigo-500/5"
                              : "text-gray-500 hover:text-white hover:bg-white/5"
                          }
                        `}
                      >
                        {child.icon}

                        {
                          child.label
                        }
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </div>
        );
      }

      /*
       * NORMAL LINK
       */

      return (
        <Link
          key={link.href}
          href={
            isLocked
              ? "#"
              : link.href
          }
          className={`
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            transition-all
            font-bold
            text-[9px]
            uppercase
            tracking-tight

            ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "hover:bg-white/5 hover:text-white"
            }

            ${
              isLocked
                ? "pointer-events-none opacity-50"
                : ""
            }
          `}
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

          <span>
            {link.label}
          </span>
        </Link>
      );
    };

    /* ---------------------------------------------------------------------- */
    /*                          RENDER SECTION                                 */
    /* ---------------------------------------------------------------------- */

    const renderSection = (
      label: string,
      items:
        | EnhancedLink[]
        | undefined
    ) => {
      if (
        !items ||
        items.length === 0
      ) {
        return null;
      }

      return (
        <div>
          <p
            className="
              px-4
              text-[11px]
              font-black
              uppercase
              tracking-widest
              text-gray-600
              mb-3
            "
          >
            {label}
          </p>

          <div className="space-y-1">
            {items.map(
              renderLink
            )}
          </div>
        </div>
      );
    };

    /* ---------------------------------------------------------------------- */
    /*                                UI                                      */
    /* ---------------------------------------------------------------------- */

    return (
      <aside
        className="
          hidden
          lg:flex
          lg:flex-col
          lg:w-72
          2xl:w-60
          bg-gray-950
          text-gray-300
          border-r
          border-white/5
          sticky
          top-0
          h-screen
        "
      >
        {/* HEADER */}

        <div
          className="
            px-8
            py-8
            flex
            flex-col
            gap-1
          "
        >
          <img
            src="/logo1-white.png"
            alt="Marvelmarts logo"
            width={100}
            height={60}
            className="
              object-contain
              w-20
            "
          />

          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.3em]
              text-gray-500
            "
          >
            {dashboardMode ===
            "CUSTOMER"
              ? "My Account"
              : dashboardMode ===
                    "ADMIN" ||
                  dashboardMode ===
                    "SUPER_ADMIN"
                ? "Control Panel"
                : "Vendor Suite"}
          </p>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            px-4
            pb-6
            space-y-7
            overflow-y-auto
            custom-scrollbar
          "
        >
          {dashboardMode ===
            "ADMIN" ||
          dashboardMode ===
            "SUPER_ADMIN" ? (
            <>
              {renderSection(
                "Main",
                computedSections.general
              )}

              {renderSection(
                "Administration",
                computedSections.administration
              )}

              {renderSection(
                "Marketplace",
                computedSections.marketplace
              )}

              {renderSection(
                "Vendor Operations",
                computedSections.vendors
              )}

              {renderSection(
                "Content & Growth",
                computedSections.content
              )}

              {renderSection(
                "Support",
                computedSections.support
              )}

              {renderSection(
                "System",
                computedSections.system
              )}
            </>
          ) : (
            <>
              {renderSection(
                "Main",
                computedSections.general
              )}

              {renderSection(
                "Management",
                computedSections.management
              )}
            </>
          )}
        </nav>

        {/* USER */}

        <div
          className="
            p-4
            border-t
            border-white/5
            bg-black/20
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              bg-white/5
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-indigo-500
                flex
                items-center
                justify-center
                text-white
                font-black
                text-lg
                shrink-0
              "
            >
              {(
                propUser?.name ||
                propUser?.email ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div
              className="
                flex-1
                min-w-0
              "
            >
              <p
                className="
                  text-[10px]
                  font-black
                  text-white
                  uppercase
                  truncate
                "
              >
                {propUser?.name ||
                  session?.user?.name ||
                  "User"}
              </p>

              <p
                className="
                  text-[9px]
                  text-gray-500
                  truncate
                "
              >
                {propUser?.email ||
                  session?.user?.email}
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
