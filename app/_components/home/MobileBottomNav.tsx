"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid2x2,
  Heart,
  Bell,
  User,
} from "lucide-react";

const items = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Grid2x2,
  },
  {
    name: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    name: "Updates",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Account",
    href: "/account/customer",
    icon: User,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center"
            >
              <Icon
                size={22}
                className={
                  active
                    ? "text-brand-primary"
                    : "text-slate-500"
                }
              />

              <span
                className={`mt-1 text-[11px] font-medium ${
                  active
                    ? "text-brand-primary"
                    : "text-slate-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}