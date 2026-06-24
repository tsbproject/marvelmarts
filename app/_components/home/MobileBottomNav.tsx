// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSelector } from "react-redux";
// import type { RootState } from "@/store";

// import {
//   Home,
//   Grid2x2,
//   Heart,
//   Package,
//   User,
// } from "lucide-react";

// const navItems = [
//   {
//     name: "Home",
//     href: "/",
//     icon: Home,
//   },
//   {
//     name: "Categories",
//     href: "/categories",
//     icon: Grid2x2,
//   },
//   {
//     name: "Wishlist",
//     href: "/wishlist",
//     icon: Heart,
//   },
//    {
//     label: "Orders",
//     href: "/account/customer/orders",
//     icon: Package,
//   },
//   {
//     name: "Account",
//     href: "/account/customer",
//     icon: User,
//   },
// ];

// export default function MobileBottomNav() {
//   const pathname = usePathname();

//   const wishlistCount = useSelector(
//     (state: RootState) => state.wishlist.items.length
//   );

//   return (
//     <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white shadow-lg xl:hidden">
//       <div className="flex h-16 items-center justify-around">
//         {navItems.map((item) => {
//           const Icon = item.icon;

//           const active =
//             pathname === item.href ||
//             (item.href !== "/" &&
//               pathname.startsWith(item.href));

//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="relative flex flex-col items-center justify-center"
//             >
//               <div className="relative">
//                 <Icon
//                   size={22}
//                   className={
//                     active
//                       ? "text-brand-primary"
//                       : "text-slate-500"
//                   }
//                 />

//                 {item.label === "Wishlist" &&
//                   wishlistCount > 0 && (
//                     <span
//                       className="
//                         absolute
//                         -right-2
//                         -top-2
//                         flex
//                         h-5
//                         min-w-5
//                         items-center
//                         justify-center
//                         rounded-full
//                         bg-brand-primary
//                         px-1
//                         text-[10px]
//                         font-bold
//                         text-white
//                       "
//                     >
//                       {wishlistCount > 99
//                         ? "99+"
//                         : wishlistCount}
//                     </span>
//                   )}
//               </div>

//               <span
//                 className={`mt-1 text-[11px] font-semibold ${
//                   active
//                     ? "text-brand-primary"
//                     : "text-slate-500"
//                 }`}
//               >
//                 {item.label}
//               </span>

//               {active && (
//                 <span
//                   className="
//                     absolute
//                     top-0
//                     h-1
//                     w-8
//                     rounded-b-full
//                     bg-brand-primary
//                   "
//                 />
//               )}
//             </Link>
//           );
//         })}
//       </div>
//     </nav>
//   );
// }




"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  Home,
  Grid2x2,
  Heart,
  Package,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Grid2x2,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Orders",
    href: "/account/customer/orders",
    icon: Package,
  },
  {
    label: "Account",
    href: "/account/customer",
    icon: User,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist.items.length
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white shadow-lg xl:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={
                    active
                      ? "text-brand-primary"
                      : "text-slate-500"
                  }
                />

                {item.label === "Wishlist" &&
                  wishlistCount > 0 && (
                    <span
                      className="
                        absolute
                        -right-2
                        -top-2
                        flex
                        h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-brand-primary
                        px-1
                        text-[10px]
                        font-bold
                        text-white
                      "
                    >
                      {wishlistCount > 99
                        ? "99+"
                        : wishlistCount}
                    </span>
                  )}
              </div>

              <span
                className={`mt-1 text-[11px] font-semibold ${
                  active
                    ? "text-brand-primary"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>

              {active && (
                <span
                  className="
                    absolute
                    top-0
                    h-1
                    w-8
                    rounded-b-full
                    bg-brand-primary
                  "
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}