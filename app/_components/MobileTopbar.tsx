"use client";

import { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Link from "next/link";
import { 
  Bars3Icon, 
  XMarkIcon, 
  BookOpenIcon, 
  TicketIcon, 
  UserCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import SignOutButton from "./SignOutButton";
import { Sections } from "@/types/dashboard";

export default function MobileTopbar({
  role,
  sections,
  isSuperAdmin,
}: {
  role: string;
  sections: Sections;
  isSuperAdmin?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Advanced Animations
  const menuVariants: Variants = {
    hidden: { x: "100%" },
    show: { 
      x: 0, 
      transition: { type: "spring", damping: 25, stiffness: 200 } 
    },
    exit: { 
      x: "100%", 
      transition: { type: "spring", damping: 25, stiffness: 200, delay: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="lg:hidden flex flex-col w-full relative">
      {/* Sleek Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">
            M
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">MarvelMarts</h2>
            <p className="text-[10px] uppercase tracking-widest font-black text-indigo-600 mt-1">{role}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-gray-50 rounded-lg text-gray-600 active:scale-90 transition-transform"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </header>

      {/* Advanced Full-Screen Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-70"
              onClick={() => setMobileOpen(false)}
            />

            <motion.nav
              variants={menuVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-80 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Admin Account</p>
                    <p className="text-xs text-gray-400">Settings & Profile</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* 1. Main Management */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Operations</p>
                  <div className="space-y-1">
                    {[...sections.general, ...sections.management].map((link) => (
                      <motion.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between group p-3 rounded-xl hover:bg-indigo-50 transition-all"
                        >
                          <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">{link.label}</span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* 2. Advanced Support Section */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Support Engine</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/dashboard/admins/support"
                      onClick={() => setMobileOpen(false)}
                      className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col gap-2 group active:scale-95 transition-all"
                    >
                      <BookOpenIcon className="w-6 h-6 text-blue-600" />
                      <span className="text-xs font-black text-blue-900 uppercase tracking-tight">Articles</span>
                    </Link>
                    <Link
                      href="/dashboard/admins/support/tickets"
                      onClick={() => setMobileOpen(false)}
                      className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col gap-2 group active:scale-95 transition-all"
                    >
                      <TicketIcon className="w-6 h-6 text-orange-600" />
                      <span className="text-xs font-black text-orange-900 uppercase tracking-tight">Tickets</span>
                    </Link>
                  </div>
                </section>

                {/* 3. Security/Permissions */}
                {!isSuperAdmin && (
                  <section className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Restricted Mode</p>
                    </div>
                    {/* 🔹 Added optional chaining to prevent mapping error */}
                    {sections?.permissionsMenu?.map((p) => (
                      <p key={p.label} className="text-[11px] text-gray-400 font-medium italic">
                        • {p.label}
                      </p>
                    ))}
                  </section>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                <SignOutButton
                  redirectPath="/auth/sign-in"
                  label="Secure Logout"
                  className="w-full py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors shadow-sm"
                />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}