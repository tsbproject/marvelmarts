


'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Heart,
  ShoppingCart,
  User,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/app/_components/SearchBar';
import CategorySidebar from '@/app/_components/CategorySidebar';
import CartDrawer from '@/app/_components/CartDrawer';

interface HamburgerMenuProps {
  children?: React.ReactNode;
}

const menuItems = [
  { label: 'Register as a Vendor', href: 'auth/register/vendor-registration', icon: null },
  { label: 'Marvelmarts FAQs', href: '/faqs', icon: null },
  { label: 'Track Orders', href: '/orders/track-order', icon: null, highlight: true },
  { label: 'My Cart', href: '/cart', icon: <ShoppingCart className="w-5 h-5 text-blue-600" /> },
  { label: 'Languages', href: '#', icon: <ChevronRight className="w-4 h-4" />, hasSubmenu: true },
  { label: 'Wishlist', href: '/wishlist', icon: <Heart className="w-5 h-5 text-pink-500" /> },
  { label: 'Login / Register', href: '/auth/register/customer-registration', icon: <User className="w-5 h-5 text-blue-600" /> },
];

const languageOptions = [
  { label: 'English', href: '/languages/en' },
  { label: 'French', href: '/languages/fr' },
  { label: 'Spanish', href: '/languages/es' },
  { label: 'Yoruba', href: '/languages/yo' },
];

export default function HamburgerMenu({ children }: HamburgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'menu'>('menu');
  const [languagesOpen, setLanguagesOpen] = useState(false);

  return (
    <div>
      {/* Hamburger Icon */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open Menu"
        className="text-brand-primary text-xl uppercase hover:text-blue-600 transition-colors duration-200"
      >
        <Menu className="w-12 h-12 border rounded-lg p-2" />
        <span className='text-lg font-medium uppercase text-white'>Menu</span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="fixed top-0 left-0 w-[30rem] h-screen bg-white shadow-2xl z-50 overflow-y-auto rounded-r-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-accent-navy">Mobile Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close Menu"
                  className="text-gray-950 text-2xl hover:text-accent-navy transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 text-lg border-b border-gray-200">
                <SearchBar />
              </div>

              {/* Tabs */}
              <div className="flex justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-1/2 py-2 text-center text-xl font-bold uppercase ${
                    activeTab === 'categories'
                      ? 'text-accent-navy border-b-2 border-brand-primary'
                      : 'text-gray-500'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`w-1/2 py-2 text-center text-xl font-bold uppercase ${
                    activeTab === 'menu'
                      ? 'text-accent-navy border-b-2 border-brand-primary'
                      : 'text-gray-500'
                  }`}
                >
                  Menu
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'categories' ? (
                  <CategorySidebar />
                ) : (
                  <ul className="space-y-3">
                    {menuItems.map(({ label, icon, highlight, href, hasSubmenu }) => (
                      <li
                        key={label}
                        className={`flex flex-col px-4 py-3 rounded-lg text-2xl cursor-pointer transition hover:bg-gray-100 ${
                          highlight ? 'bg-orange-100 text-brand-dark font-semibold' : 'text-gray-800'
                        }`}
                      >
                        {/* Main link or toggle */}
                        {hasSubmenu ? (
                          <button
                            onClick={() => setLanguagesOpen(!languagesOpen)}
                            className="flex items-center justify-between w-full"
                          >
                            <span className="flex items-center gap-2 text-2xl">
                              {icon}
                              {label}
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                languagesOpen ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                        ) : (
                          <Link href={href} className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2 text-2xl">
                              {icon}
                              {label}
                            </span>
                          </Link>
                        )}

                        {/* Submenu for Languages */}
                        <AnimatePresence>
                          {hasSubmenu && languagesOpen && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pl-6 mt-2 space-y-2 text-xl text-gray-700"
                            >
                              {languageOptions.map(({ label, href }) => (
                                <li key={label}>
                                  <Link
                                    href={href}
                                    className="block px-2 py-1 rounded-md hover:bg-gray-100 transition"
                                  >
                                    {label}
                                  </Link>
                                </li>
                                
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    ))}
                     {/* ✅ Cart Drawer inside HamburgerMenu */}
                    <li className="px-4 py-3">
                      <CartDrawer />
                    </li>
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
