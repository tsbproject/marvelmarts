import { Sections } from "@/types/dashboard";
import {
  HomeIcon,
  UsersIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  KeyIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";

// -------------------- ADMIN SECTIONS --------------------
export const adminSections: Sections = {
  general: [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <HomeIcon className="w-5 h-5" />,
      visible: true,
    },
  ],
  management: [
    {
      href: "/dashboard/admins",
      label: "Admins",
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/admins/users",
      label: "Users",
      icon: <UsersIcon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/blogs",
      label: "Blogs",
      icon: <NewspaperIcon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/admins/products",
      label: "Products",
      icon: <KeyIcon className="w-5 h-5" />,
      visible: true,
    },

    {
      href: "/dashboard/admins/communications",
      label: "Broadcast",
      icon: <MegaphoneIcon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/admins/orders",
      label: "Orders",
      icon: <KeyIcon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/admins/categories",
      label: "Categories",
      icon: <Squares2X2Icon className="w-5 h-5" />,
      visible: true,
    },
    {
      href: "/dashboard/admins/settings",
      label: "Settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      visible: true, // 🔹 Added
    },
  ],
  permissionsMenu: [],
};

// -------------------- CUSTOMER SECTIONS --------------------
export const customerSections: Sections = {
  general: [
    { href: "/account/customer/orders", label: "Orders", visible: true },
    { href: "/account/customer/wishlist", label: "Wishlist", visible: true },
    { href: "/account/customer/profile", label: "Profile", visible: true },
  ],
  management: [],
  permissionsMenu: [],
};

// -------------------- VENDOR SECTIONS --------------------
export const vendorSections: Sections = {
  general: [
    { href: "/account/vendor/products", label: "Products", visible: true },
    { href: "/account/vendor/orders", label: "Orders", visible: true },
    { href: "/account/vendor/sales", label: "Sales", visible: true },
  ],
  management: [],
  permissionsMenu: [],
};
