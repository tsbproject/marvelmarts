"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Heart, User, Settings, Store } from "lucide-react";

export default function AccountSidebar({ zone, user }: { zone: "VENDOR" | "CUSTOMER"; user: any }) {
  const pathname = usePathname();

  const vendorLinks = [
    { label: "Merchant Overview", href: "/account/vendor", icon: <LayoutDashboard size={18}/> },
    { label: "My Products", href: "/account/vendor/products", icon: <Package size={18}/> },
    { label: "Store Orders", href: "/account/vendor/orders", icon: <Store size={18}/> },
  ];

  const customerLinks = [
    { label: "My Orders", href: "/account/user", icon: <ShoppingBag size={18}/> },
    { label: "Wishlist", href: "/account/user/wishlist", icon: <Heart size={18}/> },
    { label: "Profile Settings", href: "/account/user/settings", icon: <User size={18}/> },
  ];

  const currentLinks = zone === "VENDOR" ? vendorLinks : customerLinks;

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="mb-10 px-4">
        <h2 className="font-black text-xl italic uppercase tracking-tighter">
          MARVEL<span className="text-indigo-600">MARTS</span>
        </h2>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
          {zone === "VENDOR" ? "Merchant Suite" : "Customer Account"}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {currentLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${pathname === link.href ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>

      {/* Quick Switch for Admins/Multi-role users */}
      {user?.role === "ADMIN" && (
        <div className="mt-auto pt-6 border-t border-gray-100">
          <Link 
            href={zone === "VENDOR" ? "/account/user" : "/account/vendor"}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Switch to {zone === "VENDOR" ? "Buyer" : "Merchant"}
          </Link>
        </div>
      )}
    </div>
  );
}