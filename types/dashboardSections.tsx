import { Sections } from "@/types/dashboard";

import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// -------------------- ADMIN SECTIONS --------------------
export const adminSections: Sections = {
  general: [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <HomeIcon className="w-5 h-5" />,
    },
  ],
  management: [
    {
      href: "/dashboard/admins",
      label: "Admins",
      icon: <ShieldCheckIcon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admins/users",
      label: "Users",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/blogs",
      label: "Blogs",
      icon: <NewspaperIcon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admins/products",
      label: "Products",
      icon: <KeyIcon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admins/orders",
      label: "Orders",
      icon: <KeyIcon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admins/categories",
      label: "Categories",
      icon: <Squares2X2Icon className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admins/settings",
      label: "Settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
    },
  ],
  permissionsMenu: [],
};

// -------------------- CUSTOMER SECTIONS --------------------
export const customerSections: Sections = {
  general: [
    { href: "/account/customer/orders", label: "Orders" },
    { href: "/account/customer/wishlist", label: "Wishlist" },
    { href: "/account/customer/profile", label: "Profile" },
  ],
  management: [],
  permissionsMenu: [],
};

// -------------------- VENDOR SECTIONS --------------------
export const vendorSections: Sections = {
  general: [
    { href: "/account/vendor/products", label: "Products" },
    { href: "/account/vendor/orders", label: "Orders" },
    { href: "/account/vendor/sales", label: "Sales" },
  ],
  management: [],
  permissionsMenu: [],
};
