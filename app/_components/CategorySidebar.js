'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Laptop,
  Smartphone,
  Tv,
  Shirt,
  Home,
  Baby,
  Car,
  HeartPulse,
  Palette,
  ChevronRight,
} from 'lucide-react';

export default function CategorySidebar() {
  const [open, setOpen] = useState(true);

  const categories = [
    { name: 'Computers and Accessories', icon: Laptop },
    { name: 'Phones and Tablets', icon: Smartphone },
    { name: 'Electronics', icon: Tv },
    { name: 'MarvelMarts Fashion', icon: Shirt },
    { name: 'Home and Kitchens', icon: Home },
    { name: 'Baby, Kids and Toys', icon: Baby },
    { name: 'Automobile', icon: Car },
    { name: 'Health and Beauty', icon: HeartPulse },
    { name: 'African Arts & Crafts', icon: Palette },
    { name: 'Other Categories', icon: Grid },
  ];

  return (
    <div className="relative w-85 md:w-95 z-20">
      {/* Header */}
      <div
        className="flex items-center justify-between bg-[var(--color-brand-primary)] text-white px-4 py-3 cursor-pointer rounded-t-md shadow-md "
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center space-x-2 ">
          <Grid className="w-6 h-6" />
          <span className="font-semibold uppercase text-xl">Browse Categories</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Dropdown List */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // bounce-like
            className="bg-white shadow-lg rounded-b-md overflow-hidden"
          >
            <ul className="divide-y divide-gray-100 z-1000">
              {categories.map(({ name, icon: Icon }) => (
                <li
                  key={name}
                  className="flex items-center justify-between px-4 py-3 md:h-17 hover:bg-gray-50 cursor-pointer transition-colors duration-150 "
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-7 h-7 text-gray-500" />
                    <span className="text-xl font-medium text-gray-700">{name}</span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
