"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Menu,
  X,
  Heart,
  ShoppingCart,
  User,
  ChevronRight,
  Globe,
  Package,
  Store,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/_components/SearchBar";
import UserMenu from "./UserMenu";
import CategoryMenu from "./CategoryMenu";
import { CategoryWithChildren as CategoryTree } from "../layout";

const menuItems = [
  { label: "Sell On MarvelMarts", href: "/auth/register/vendor-registration", icon: <Store className="w-5 h-5" /> },
  { label: "Marvelmarts FAQs", href: "/faqs", icon: <HelpCircle className="w-5 h-5" /> },
  { label: "Track Orders", href: "/track-order", icon: <Package className="w-5 h-5" />, highlight: true },
  { label: "My Cart", href: "/cart", icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "Languages", href: "#", icon: <Globe className="w-5 h-5" />, hasSubmenu: true },
  { label: "Wishlist", href: "/wishlist", icon: <Heart className="w-5 h-5 text-red-500" /> },
];

const drawerVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
  exit: {
    x: "-100%",
    transition: { ease: "easeInOut", duration: 0.3 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function HamburgerMenu({ categories }: { categories: CategoryTree[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"categories" | "menu">("menu");
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div>
      {/* Hamburger Trigger */}
      <button
        onClick={() => setMenuOpen(true)}
        className="group flex flex-col items-center gap-1 focus:outline-none"
      >
        <div className="flex items-center gap-3 bg-neutral-white/10 hover:bg-neutral-white/20 p-2 rounded-xl transition-all text-brand-primary">
          <Menu className="w-7 h-7" />
          <span className="hidden sm:block text-sm font-bold uppercase tracking-tighter">
            Menu
          </span>
        </div>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-[1001]"
            />

            {/* Main Drawer Container */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 w-full max-w-[250px] h-screen bg-neutral-light shadow-2xl z-[1002] overflow-hidden flex flex-col"
            >
              {/* Branding Header */}
              <div className="flex items-center justify-between px-6 py-5 bg-neutral-white border-b border-gray-100">
                <div>
                  <img
                    src="/logo1-blue.png"
                    alt="Marvelmarts logo"
                    width={100}
                    height={60}
                  //    style={{ width: 'auto', height: 'auto' }}
                      // priority
                      // quality={100}
                    className="object-contain w-50"
                  />
                  <p className="text-[10px] text-neutral-gray uppercase tracking-widest font-bold">
                    Premium Marketplace
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-neutral-light rounded-full transition-colors text-accent-navy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

           
              <div className="p-4 bg-neutral-white border-b border-gray-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setTimeout(() => setUserMenuOpen(true), 300);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-accent-navy text-neutral-white hover:bg-neutral-dark transition-all shadow-lg shadow-accent-navy/20"
                >
                  <User className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase opacity-60">
                      Welcome back
                    </p>
                    <p className="text-sm font-black">My Account</p>
                  </div>
                </button>
              </div>

              {/* Tactical Search Bar */}
              <div className="px-4 py-4 bg-neutral-white">
                <SearchBar />
              </div>

              {/* Content Selection Tabs */}
              <div className="px-4 py-2 bg-neutral-white">
                <div className="flex p-1 bg-neutral-light rounded-xl">
                  {(["menu", "categories"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-neutral-white text-accent-navy shadow-sm"
                          : "text-neutral-gray hover:text-accent-navy"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable List Section */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <AnimatePresence mode="wait">
                  {activeTab === "categories" ? (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CategoryMenu
                        initialCategories={categories}
                        onClose={handleNavClick}
                      />
                    </motion.div>
                  ) : (
                    <motion.ul
                      key="menu"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      {menuItems.map((item) => (
                        <motion.li key={item.label} variants={itemVariants}>
                          {item.hasSubmenu ? (
                            <div className="rounded-xl overflow-hidden bg-neutral-white shadow-sm border border-gray-50">
                              <button
                                onClick={() => setLanguagesOpen(!languagesOpen)}
                                className="w-full flex items-center justify-between p-4 text-accent-navy font-bold hover:bg-brand-light/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-accent-navy/5 rounded-lg text-accent-navy">
                                    {item.icon}
                                  </div>
                                  <span className="text-sm">{item.label}</span>
                                </div>
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    languagesOpen ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={handleNavClick}
                              className={`flex items-center justify-between p-4 rounded-xl shadow-sm border transition-all ${
                                item.highlight
                                  ? "bg-brand-primary text-neutral-white border-brand-primary shadow-brand-primary/20"
                                  : "bg-neutral-white text-accent-navy border-gray-50 hover:border-accent-navy/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.highlight ? "bg-neutral-white/20 text-neutral-white" : "bg-accent-navy/5 text-accent-navy"}`}>
                                  {item.icon}
                                </div>
                                <span className="text-[10px] font-bold">
                                  {item.label}
                                </span>
                              </div>
                            </Link>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />

      {/* Global Transition Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-accent-navy/20 backdrop-blur-md z-[2000]"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
