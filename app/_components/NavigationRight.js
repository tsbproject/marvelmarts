

// 'use client';

// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ShoppingCart, HelpCircle } from 'lucide-react';

// export default function NavigationLeft() {
//   const [helpOpen, setHelpOpen] = useState(false);

//   return (
//     <div className="flex items-center justify-end w-full md:max-w-416 mx-auto -mt-8 md:mt-24 px-4 relative ">
//       {/* 🛒 Help + Cart + User */}
//       <div className="flex items-center space-x-13 relative">
//         {/* 🆘 Help Section */}
//         <div
//           className="relative flex items-center space-x-1 cursor-pointer group"
//           onMouseEnter={() => setHelpOpen(true)}
//           onMouseLeave={() => setHelpOpen(false)}
//         >
//           <HelpCircle className="w-10 h-10 text-brand-primary hover:text-blue-600 transition-colors duration-200" />
//           <span className="absolute -top-0 -right-9 bg-blue-600 text-white text-md px-1.5 py-0.5 rounded-full">
//             Help
//           </span>

//           <AnimatePresence>
//             {helpOpen && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.25, ease: 'easeInOut' }}
//                 className="absolute left-0 top-12 bg-white shadow-2xl rounded-xl overflow-visible w-53 z-99999"
//               >
//                 <ul className="text-sm text-gray-700">
//                   {[
//                     'Track My Order',
//                     'Contact Us',
//                     'FAQs',
//                     'Help Center',
//                     'Return Policy',
//                   ].map((item) => (
//                     <li
//                       key={item}
//                       className="px-4 py-2 text-xl md:text-2xl hover:bg-gray-100 cursor-pointer transition-colors duration-150"
//                     >
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* 🛒 Cart */}
//         <div className="relative group cursor-pointer">
//           <ShoppingCart className="w-10 h-10 text-brand-primary hover:text-blue-600 transition-colors duration-200" />
//           <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-md px-1.5 py-0.5 rounded-full">
//             2
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, HelpCircle } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function NavigationLeft() {
  const [helpOpen, setHelpOpen] = useState(false);

  const menuItems = [
    { label: "Track My Order", href: "/orders/track" },
    { label: "Contact Us", href: "/support/contact" },
    { label: "FAQs", href: "/support/faqs" },
    { label: "Help Center", href: "/support" },
    { label: "Return Policy", href: "/support/returns" },
  ];

  return (
    <div className="flex items-center justify-end w-full max-w-xl mx-auto mt-6 md:mt-24 px-4 relative">
      {/* Help + Cart */}
      <div className="flex items-center space-x-8 relative">
        {/* Help Section */}
        <div
          className="relative flex items-center space-x-1 cursor-pointer group"
          onMouseEnter={() => setHelpOpen(true)}
          onMouseLeave={() => setHelpOpen(false)}
        >
          <HelpCircle className="w-8 h-8 text-brand-primary hover:text-blue-600 transition-colors duration-200" />
          <span className="absolute -top-1 right-10 bg-blue-600 text-white text-xl px-2 py-0.5 rounded-full shadow">
            Help
          </span>

          <AnimatePresence>
            {helpOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute left-0 top-10 bg-white shadow-lg rounded-lg overflow-hidden w-56 z-50 border border-gray-100"
              >
                <ul className="divide-y divide-gray-100">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart */}
        <div className=" flex relative group cursor-pointer mt-2 gap-2">
          <CartDrawer /> 
          {/* <ShoppingCart className="w-8 h-8 text-brand-primary hover:text-blue-600 transition-colors duration-200" />
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
            2
          </span>
          Cart */}
        </div>
      </div>
    </div>
  );
}
