'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X } from 'lucide-react';

export default function UserMenu() {
  const [userOpen, setUserOpen] = useState(false);

  const menuItems = [
    { label: 'Sign In', type: 'auth' },
    { label: 'Register', type: 'auth' },
    { label: 'My Orders', type: 'normal' },
    { label: 'Wishlist', type: 'normal' },
    { label: 'Product Reviews', type: 'normal' },
  ];

  return (
    <div className="relative">
      {/* User Icon */}
      <button
        onClick={() => setUserOpen(true)}
        className="relative z-30 flex items-center justify-center p-2 rounded-full text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200"
      >
        <User className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {userOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setUserOpen(false)}
            />

            {/* Right-side sliding menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 15,
              }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl z-30 rounded-l-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">User Menu</h2>
                <button
                  onClick={() => setUserOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu items */}
              <ul className="flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    className={`px-6 py-4 cursor-pointer transition-all duration-200 border-b border-gray-100 ${
                      item.type === 'auth'
                        ? 'bg-gray-50 font-semibold text-blue-600 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
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
