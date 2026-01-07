

"use client";

import { useState } from "react";
import { AnimatePresence, motion,Variants } from "framer-motion";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import SignOutButton from "./SignOutButton";
import { Sections } from "@/types/dashboard"; // <-- shared type

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

  const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 250 } },
  exit: { opacity: 0, x: -15 },
};


  return (
    <div className="lg:hidden flex flex-col w-full relative">
      {/* Header */}
      <header className="bg-brand-primary text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">MarvelMarts</h2>
          <p className="text-sm">{role} Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton
            redirectPath="/auth/sign-in"
            label="Sign Out"
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? (
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay + Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileOpen(false)} //close when clicking outside
            />

            {/* Dropdown menu */}
            <motion.nav
              variants={dropdownVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute top-full left-0 right-0 bg-gray-700 text-white px-4 py-3 space-y-2 rounded-b-lg shadow-lg z-50"
            >
              {sections.general.map((link) => (
                <motion.div key={link.href} variants={linkVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block hover:bg-gray-600 rounded px-3 py-2 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {sections.management.map((link) => (
                <motion.div key={link.href} variants={linkVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block hover:bg-gray-600 rounded px-3 py-2 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {!isSuperAdmin &&
                sections.permissionsMenu.map((link) => (
                  <motion.div key={link.label} variants={linkVariants}>
                    <span className="block px-3 py-2 text-gray-300">
                      {link.label}
                    </span>
                  </motion.div>
                ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
