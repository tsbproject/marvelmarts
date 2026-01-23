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
  { label: "Register as a Vendor", href: "/auth/register/vendor-registration", icon: <Store className="w-5 h-5" /> },
  { label: "Marvelmarts FAQs", href: "/faqs", icon: <HelpCircle className="w-5 h-5" /> },
  { label: "Track Orders", href: "/orders/track-order", icon: <Package className="w-5 h-5" />, highlight: true },
  { label: "My Cart", href: "/cart", icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "Languages", href: "#", icon: <Globe className="w-5 h-5" />, hasSubmenu: true },
  { label: "Wishlist", href: "/wishlist", icon: <Heart className="w-5 h-5 text-red-500" /> },
];

const languageOptions = [
  { label: "English", code: "EN" },
  { label: "French", code: "FR" },
  { label: "Spanish", code: "ES" },
  { label: "Yoruba", code: "YO" },
];

// Variants defined outside to resolve the red underline and performance
const drawerVariants: Variants = {
  hidden: { x: "-100%" },
  visible: { 
    x: 0, 
    transition: { type: "spring", damping: 25, stiffness: 200 } 
  },
  exit: { x: "-100%", transition: { ease: "easeInOut", duration: 0.3 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
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
        <div className="flex items-center gap-3 bg-neutral-white/10 hover:bg-neutral-white/20 p-2 rounded-xl transition-all">
          <Menu className="w-8 h-8 text-brand-primary" />
          <span className="hidden sm:block text-sm font-bold uppercase tracking-tighter text-brand-primary">Menu</span>
        </div>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop with Brand Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-1001"
            />

            {/* Main Drawer */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 w-full max-w-[230px] h-screen bg-neutral-light shadow-2xl z-1002 overflow-hidden flex flex-col"
            >
              {/* Refined Header */}
              <div className="flex items-center justify-between px-6 py-5 bg-neutral-white border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-black text-accent-navy tracking-tight">MARVELMARTS</h2>
                  <p className="text-[10px] text-neutral-gray uppercase tracking-widest font-bold">Premium Armory</p>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-neutral-light rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-accent-navy" />
                </button>
              </div>

              {/* Search Area */}
              <div className="px-4 py-4 bg-neutral-white">
                <SearchBar />
              </div>

              {/* Segmented Tabs */}
              <div className="px-4 py-2 bg-neutral-white">
                <div className="flex p-1 bg-neutral-light rounded-xl">
                  {(["menu", "categories"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-xl font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
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

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <AnimatePresence mode="wait">
                  {activeTab === "categories" ? (
                    <motion.div
                      key="cats"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CategoryMenu initialCategories={categories} />
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
                                  <div className="p-2 bg-accent-navy/5 rounded-lg text-accent-navy">{item.icon}</div>
                                  <span className="text-xl">{item.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${languagesOpen ? "rotate-90" : ""}`} />
                              </button>
                              
                              <AnimatePresence>
                                {languagesOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-neutral-light/50"
                                  >
                                    <div className="grid grid-cols-2 gap-2 p-4">
                                      {languageOptions.map((lang) => (
                                        <button 
                                          key={lang.code}
                                          className="p-3 text-xs font-bold text-neutral-gray bg-neutral-white border border-gray-100 rounded-lg hover:border-brand-primary hover:text-accent-navy transition-all"
                                        >
                                          {lang.label} ({lang.code})
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
                                <span className="text-xl font-bold">{item.label}</span>
                              </div>
                            </Link>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Account Section */}
              <div className="p-4 bg-neutral-white border-t border-gray-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setTimeout(() => setUserMenuOpen(true), 300);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-accent-navy text-neutral-white hover:bg-neutral-dark transition-all shadow-lg shadow-accent-navy/20"
                >
                  <div className="relative">
                    <User className="w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-10 bg-brand-primary border-2 border-accent-navy rounded-full"></div>
                  </div>
                  <div className="text-left mt-4">
                    <p className="text-lg font-bold text-neutral-white/60 uppercase tracking-tighter">Welcome back</p>
                    <p className="text-lg font-black text-neutral-white">My Account</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />

      {/* Modern Loader Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-accent-navy/20 backdrop-blur-md z-[2000]"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}