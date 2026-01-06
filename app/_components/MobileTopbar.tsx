// app/components/MobileTopbar.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  return (
    <div className="lg:hidden flex flex-col w-full">
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
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            variants={{
              hidden: { opacity: 0, y: -10 },
              show: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
            }}
            initial="hidden"
            animate="show"
            exit="exit"
            className="bg-gray-700 text-white px-4 py-3 space-y-2"
          >
            {sections.general.map((link) => (
              <motion.div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block hover:bg-gray-600 rounded px-3 py-2"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {sections.management.map((link) => (
  <motion.div key={link.href}>
    <Link
      href={link.href}
      onClick={() => setMobileOpen(false)}
      className="block hover:bg-gray-600 rounded px-3 py-2"
    >
      {link.label}
    </Link>
  </motion.div>
))}

{!isSuperAdmin &&
  sections.permissionsMenu.map((link) => (
    <motion.div key={link.label}>
      <span className="block px-3 py-2 text-gray-300">{link.label}</span>
    </motion.div>
  ))}

            {!isSuperAdmin &&
              sections.permissionsMenu &&
              sections.permissionsMenu.map((link) => (
                <motion.div key={link.label}>
                  <span className="block px-3 py-2 text-gray-300">
                    {link.label}
                  </span>
                </motion.div>
              ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
