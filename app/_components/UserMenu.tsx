"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MenuItem {
  label: string;
  type: "auth" | "normal";
  link?: string;
}

export default function UserMenu() {
  const [userOpen, setUserOpen] = useState(false);
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { label: "Sign In", type: "auth", link: "/auth/sign-in" },
    { label: "Register", type: "auth", link: "/auth/register/customer-registration" },
    { label: "My Orders", type: "normal", link: "/orders" },
    { label: "Wishlist", type: "normal", link: "/wishlist" },
    { label: "Product Reviews", type: "normal", link: "/reviews" },
  ];

  const handleClick = (item: MenuItem) => {
    if (item.link) {
      router.push(item.link);
      setUserOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* User Icon */}
      <button
        onClick={() => setUserOpen(true)}
        className="
          relative z-30 
          flex items-center justify-center 
          p-2 rounded-full 
          text-brand-primary
          hover:text-blue-600 
          transition-colors duration-200
          
          /* FIXED POSITIONING — NO HYDRATION ISSUES */
          lg:absolute 
          lg:top-0 
          lg:right-0
        "
      >
        <User className="w-10 h-10" />
      </button>

      {/* Overlay + Menu */}
      <AnimatePresence>
        {userOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setUserOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="
                fixed top-0 right-0 
                h-full w-[80%] max-w-sm 
                bg-white shadow-2xl z-30 
                rounded-l-2xl flex flex-col
              "
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  User Menu
                </h2>
                <button
                  onClick={() => setUserOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-10 h-10" />
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    onClick={() => handleClick(item)}
                    className={`
                      px-6 py-4 cursor-pointer 
                      border-b border-gray-100 
                      transition-all duration-200 text-2xl
                      ${
                        item.type === "auth"
                          ? "bg-color-accent-navy text-blue-600 font-semibold hover:bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

