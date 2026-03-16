"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Menu, X, LogOut, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// --- Animation Variants (Preserved) ---
const menuVariants: Variants = {
  hidden: { x: "100%" },
  show: { 
    x: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      staggerChildren: 0.07, 
      delayChildren: 0.2     
    } 
  },
  exit: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

interface MobileTopbarProps {
  role: string;
  sections: any;
  isSuperAdmin?: boolean;
  todayRevenue?: number;
  permissions?: Record<string, boolean> | null; 
  roles: "VENDOR" | "CUSTOMER";
  vendorLocked?: boolean; 

  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    
  };
}

export default function MobileTopbar({
  role,
  sections,
  isSuperAdmin,
  todayRevenue = 0,
  user
}: MobileTopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Access Redux for Real-time Review Intel (Preserved)
  const { reviews } = useSelector((state: RootState) => state.admin || { reviews: [] });
  const pendingReviewsCount = reviews?.filter((r: any) => !r.approved).length || 0;

  const handleLogout = () => signOut({ callbackUrl: "/auth/sign-in" });
  
  // Refined check for Admin/Vendor/Customer status
  const normalizedRole = role.toUpperCase();
  const isAdmin = normalizedRole.includes("ADMIN");
  const isVendor = normalizedRole.includes("VENDOR");
  const isCustomer = normalizedRole === "CUSTOMER" || normalizedRole === "USER";

  return (
    <>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#002B5B] rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
          <span className="font-black italic tracking-tighter text-xl uppercase text-[#002B5B]">
            Marvel<span className="text-[#F7931E]">Marts</span>
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-gray-50 rounded-xl text-gray-900 shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50"
            />

            <motion.nav
              variants={menuVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[60] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                    {isCustomer ? "Account Menu" : "Command Center"}
                  </span>
                  <span className="text-sm font-black uppercase tracking-tighter italic text-[#002B5B]">
                    {isCustomer ? "Customer" : role} Access
                  </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-gray-100 rounded-2xl text-gray-400 active:rotate-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* USER PROFILE INFO */}
                <motion.div variants={itemVariants} className="flex items-center gap-4 p-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                    {user?.image ? (
                      <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase text-gray-900 truncate">{user?.name || "Member"}</p>
                    <p className="text-[9px] font-bold text-gray-400 truncate">{user?.email}</p>
                  </div>
                </motion.div>

                {/* REVENUE WIDGET (Strictly for Admins/Vendors) */}
                {(isAdmin || isVendor) && (
                  <motion.section variants={itemVariants} className="relative overflow-hidden p-6 rounded-[2.5rem] bg-[#002B5B] text-white shadow-xl shadow-indigo-100">
                    <div className="relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Live Revenue Today
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-md xl:text-xl 2xl:text-2xl font-black italic tracking-tighter">
                          ₦{todayRevenue.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase">NGN</span>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500 rounded-full opacity-30 blur-2xl" />
                  </motion.section>
                )}

                {/* Navigation Sections */}
                {sections && Object.entries(sections).map(([key, items]: [string, any]) => (
                  <motion.section key={key} variants={itemVariants}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 px-2">
                      {key}
                    </h3>
                    <div className="space-y-2">
                      {Array.isArray(items) && items.map((item, index) => {
                        const isReviewLink = item.label.toLowerCase().includes("review");
                        
                        return (
                          <Link
                            key={`${item.label}-${index}`}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && <span className="text-gray-400 group-hover:text-indigo-600">{item.icon}</span>}
                              <span className="text-xs font-black uppercase tracking-widest">
                                {item.label}
                              </span>
                              {isReviewLink && pendingReviewsCount > 0 && isAdmin && (
                                <span className="bg-[#F7931E] text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                  {pendingReviewsCount}
                                </span>
                              )}
                            </div>
                            <ChevronRight 
                              size={14} 
                              className="text-gray-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" 
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* Drawer Footer / Logout */}
              <motion.div variants={itemVariants} className="p-6 border-t border-gray-50 bg-gray-50/30">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <LogOut size={18} />
                  Secure Logout
                </button>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}