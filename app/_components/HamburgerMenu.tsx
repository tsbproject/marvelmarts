"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Heart,
  ShoppingCart,
  User,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/_components/SearchBar";
import UserMenu from "./UserMenu";
import CategoryMenu from "./CategoryMenu";
import { CategoryWithChildren as CategoryTree } from "../layout";

// menuItems definition
const menuItems = [
  { label: "Register as a Vendor", href: "/auth/register/vendor-registration", icon: null },
  { label: "Marvelmarts FAQs", href: "/faqs", icon: null },
  { label: "Track Orders", href: "/orders/track-order", icon: null, highlight: true },
  { label: "My Cart", href: "/cart", icon: <ShoppingCart className="w-5 h-5 text-blue-600" /> },
  { label: "Languages", href: "#", icon: <ChevronRight className="w-5 h-5" />, hasSubmenu: true },
  { label: "Wishlist", href: "/wishlist", icon: <Heart className="w-5 h-5 text-pink-500" /> },
];

// ✅ RESTORED: languageOptions definition
const languageOptions = [
  { label: "English", href: "/languages/en" },
  { label: "French", href: "/languages/fr" },
  { label: "Spanish", href: "/languages/es" },
  { label: "Yoruba", href: "/languages/yo" },
];

interface HamburgerMenuProps {
  children?: React.ReactNode;
  categories: CategoryTree[];
}

export default function HamburgerMenu({ children, categories }: HamburgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"categories" | "menu">("menu");
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div>
      {/* Hamburger Icon */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open Menu"
        className="text-brand-primary text-xl uppercase hover:text-blue-600 transition-colors duration-200"
      >
        <Menu className="w-12 h-12 border rounded-lg p-2" />
        <span className="text-lg font-medium uppercase text-white">Menu</span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 18, duration: 0.25 }}
              className="fixed top-0 left-0 w-80 h-screen bg-white shadow-2xl z-50 overflow-y-auto rounded-r-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-accent-navy text-brand-navy">Mobile Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X className="w-6 h-6 text-brand-black" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <SearchBar />
              </div>

              {/* Tabs */}
              <div className="flex justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`w-1/2 py-2 text-center text-xl font-bold uppercase ${
                    activeTab === "categories" ? "text-brand-navy border-b-2 border-brand-orange" : "text-gray-500"
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab("menu")}
                  className={`w-1/2 py-2 text-center text-xl font-bold uppercase ${
                    activeTab === "menu" ? "text-brand-navy border-b-2 border-brand-orange" : "text-gray-500"
                  }`}
                >
                  Menu
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === "categories" ? (
                  <CategoryMenu initialCategories={categories} />
                ) : (
                  <ul className="space-y-3">
                    {menuItems.map(({ label, icon, highlight, href, hasSubmenu }) => (
                      <li
                        key={label}
                        className={`flex flex-col px-4 py-3 rounded-lg text-2xl transition hover:bg-brand-orange-light ${
                          highlight ? "bg-orange-100 text-brand-black font-semibold" : "text-brand-gray"
                        }`}
                      >
                        {hasSubmenu ? (
                          <div className="w-full">
                            <button
                              onClick={() => setLanguagesOpen(!languagesOpen)}
                              className="flex items-center justify-between w-full"
                            >
                              <span className="flex items-center gap-2">
                                {icon}
                                {label}
                              </span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${languagesOpen ? "rotate-90" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {languagesOpen && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pl-6 mt-2 space-y-2 text-lg text-brand-gray"
                                >
                                  {languageOptions.map((lang) => (
                                    <li key={lang.label}>
                                      <Link href={lang.href} onClick={handleNavClick} className="block py-1 hover:text-brand-orange">
                                        {lang.label}
                                      </Link>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link href={href} className="flex items-center gap-2" onClick={handleNavClick}>
                            {icon}
                            {label}
                          </Link>
                        )}
                      </li>
                    ))}

                    <li className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setTimeout(() => setUserMenuOpen(true), 300);
                        }}
                        className="flex items-center gap-2 text-2xl font-medium text-brand-navy"
                      >
                        <User className="w-6 h-6 text-brand-navy" />
                        <span>Account</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-[999]"
          >
            <div className="w-12 h-12 border-4 border-brand-navy border-t-brand-orange rounded-full animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
