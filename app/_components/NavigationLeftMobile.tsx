'use client';

import { useState } from 'react';
import { ShoppingCart, User, HelpCircle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';




export default function NavigationLeftMobile() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  
  return (
    <div className="flex flex-col items-center justify-end w-full px-6 md:px-4 py-10 md:py-2 lg:hidden">
     
      

        {/* ✅ User Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 transition"
          >
            <span className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-brand-primary" />
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
                <li className="px-4 py-2 mt-2 text-xl font-bold text-white text-center bg-accent-navy rounded-lg cursor-pointer hover:bg-blue-800 transition">
                  Sign In
                </li>
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

        {/* ✅ Cart */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-800 text-xl">
            <ShoppingCart className="w-5 h-5 text-brand-primary" />
            <span>Cart</span>
          </div>
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
        </div>

        {/* ✅ Help Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 transition"
          >
            <span className="flex items-center gap-2 text-xl">
              <HelpCircle className="w-5 h-5 text-brand-primary" />
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
                {['Track My Order', 'Contact Us', 'FAQs', 'Help Center', 'Return Policy'].map(
                  (item) => (
                    <li
                      key={item}
                      className="px-2 py-2 hover:text-blue-600 cursor-pointer border-t border-gray-100"
                    >
                      {item}
                    </li>
                  )
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      
    </div>
  );
}
