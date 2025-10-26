'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingCart, User, HelpCircle } from 'lucide-react';
import CategorySidebar from './CategorySidebar';

export default function NavigationLeftMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-end w-full px-4 py-2 lg:hidden">
      {/* Hamburger Icon */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open Menu"
        className="text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200"
      >
        <Menu className="w-8 h-8" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="fixed top-0 left-0 w-90 h-screen  bg-white shadow-2xl z-50 overflow-y-auto rounded-r-2xl"
            >
              {/* Header Section */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Mobile Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close Menu"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full 
                               focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
                               transition-all duration-200"
                  />
                </div>
              </div>
                {/* Category Sidebar Mobile version */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 flex items-center gap-2 bg-orange-500 text-white rounded-md"
                  >
                    <Menu className="w-5 h-5" />
                    <span>Browse Categories</span>
                  </button>

                  {isOpen && (
                    <div className="absolute top-0 left-0 w-full bg-white shadow-lg z-50">
                      {/* Category Sidebar content */}
                      <CategorySidebar />
                    </div>
                  )}
                </div>

               {/* User Section */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5 text-[var(--color-brand-primary)]" />
                    Account
                  </span>
                  <span className={`transform transition-transform ${userOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="pl-6 text-gray-700 text-sm bg-gray-50"
                    >
                      {/* Sign In */}
                      <li className="px-4 py-2 mt-2 text-xl font-bold text-white text-center bg-[var(--color-accent-navy)] rounded-lg cursor-pointer hover:bg-blue-800 transition">
                        Sign In
                      </li>

                      {/* Register */}
                      <li className="px-4 py-2 mt-2 text-xl font-semibold text-white text-center bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Register
                      </li>

                      <div className="border-t border-gray-200 my-2 " />

                      {['My Orders', 'Wishlist', 'Product Reviews'].map((item) => (
                        <li
                          key={item}
                          className="px-4 py-2 text-xl hover:text-blue-600 cursor-pointer border-t border-gray-100"
                        >
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              
              {/* Cart */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-800 text-xl">
                  <ShoppingCart className="w-5 h-5 text-[var(--color-brand-primary)]" />
                  <span>Cart</span>
                </div>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </div>


              {/* Help Section */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setHelpOpen(!helpOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2 text-xl">
                    <HelpCircle className="w-5 h-5 text-[var(--color-brand-primary)]" />
                    Help
                  </span>
                  <span className={`transform transition-transform ${helpOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {helpOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="pl-10 text-gray-700 text-xl bg-gray-50 "
                    >
                      {[
                        'Track My Order',
                        'Contact Us',
                        'FAQs',
                        'Help Center',
                        'Return Policy',
                      ].map((item) => (
                        <li
                          key={item}
                          className="px-2 py-2 hover:text-blue-600 cursor-pointer border-t border-gray-100"
                        >
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

             
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
