// 'use client';

// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, ShoppingCart, User, HelpCircle } from 'lucide-react';

// export default function NavigationLeft() {
//   const [helpOpen, setHelpOpen] = useState(false);
//   const [userOpen, setUserOpen] = useState(false);

//   return (
//     <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 mt-16">
     

//       {/* 🔍 Center Search */}
//       <div className="flex-1 flex justify-center px-6 md:-ml-[15rem] md:mb-5">
//         <div className="relative w-full max-w-md md:max-w-xl">
//           <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search for products..."
//             className="w-full md:w-[40rem] pl-10 pr-4 py-2 text-[var(--color-neutral-white)] border border-gray-300 rounded-full 
//                        focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
//                        transition-all duration-200"
//           />
//         </div>
//       </div>

      

//       {/* 🛒 Cart & 👤 User */}
//       <div className="flex items-center space-x-13">
//            {/* 🆘 Help Section */}
//       <div
//         className="relative flex items-center space-x-1 cursor-pointer group"
//         onMouseEnter={() => setHelpOpen(true)}
//         onMouseLeave={() => setHelpOpen(false)}
//       >
//         <HelpCircle  className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />        
//           <span className="absolute -top-0 -right-9 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
//           Help
//         </span>

//         <AnimatePresence>
//           {helpOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.25, ease: 'easeInOut' }}
//               className="absolute left-0 top-8 mt-3 bg-white shadow-2xl rounded-xl overflow-hidden w-40 z-20"
//             >
//               <ul className="text-sm text-gray-700 ">
//                 {[
                 
//                   'Track My Order',
//                   'Contact Us',
//                   'FAQs',
//                   'Help Center',
//                   'Return Policy',
//                 ].map((item) => (
//                   <li
//                     key={item}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
//                   >
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>



//         {/* Cart */}
//         <div className="relative group cursor-pointer">
//           <ShoppingCart className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />        
//           <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
//           2
//         </span>
//         </div>

      
//         {/* 👤 User */}
//         <div
//           className="relative"
//           onMouseEnter={() => setUserOpen(true)}
//           onMouseLeave={() => setUserOpen(false)}
//         >
//           <User className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />

//           <AnimatePresence>
//             {userOpen && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.25, ease: 'easeInOut' }}
//                 className="absolute right-0 mt-3 bg-white shadow-2xl rounded-xl overflow-hidden w-52 z-20"
//               >
//                 <ul className="text-sm text-gray-700">
//                   {/* Sign In */}
//                   <li
//                     className="px-4 py-2 font-extrabold text-white bg-[var(--color-accent-navy)] hover:bg-blue-700 cursor-pointer transition-colors duration-150 text-center"
//                   >
//                     Sign In
//                   </li>

//                   {/* Register */}
//                   <li
//                     className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-150 text-center"
//                   >
//                     Register
//                   </li>

//                   {/* Divider */}
//                   <div className="border-t border-gray-200 my-1" />

//                   {/* Other Items */}
//                   {['My Orders', 'Wishlist', 'Product Reviews'].map((item) => (
//                     <li
//                       key={item}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
//                     >
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

     
//       </div>
//     </div>
//   );
// }



'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, HelpCircle } from 'lucide-react';

export default function NavigationLeft() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 mt-16">
      {/* 🔍 Center Search */}
      <div className="flex-1 flex justify-center px-6 md:-ml-[15rem] md:mb-5">
        <div className="relative w-full max-w-md md:max-w-xl">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full md:w-[40rem] pl-10 pr-4 py-2 text-[var(--color-neutral-white)] border border-gray-300 rounded-full 
                       focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
                       transition-all duration-200"
          />
        </div>
      </div>

      {/* 🛒 Help + Cart + User */}
      <div className="flex items-center space-x-13">
        {/* 🆘 Help Section */}
        <div
          className="relative flex items-center space-x-1 cursor-pointer group"
          onMouseEnter={() => setHelpOpen(true)}
          onMouseLeave={() => setHelpOpen(false)}
        >
          <HelpCircle className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />
          <span className="absolute -top-0 -right-9 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            Help
          </span>

          <AnimatePresence>
            {helpOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute left-0 top-8 mt-3 bg-white shadow-2xl rounded-xl overflow-hidden w-44 z-20"
              >
                <ul className="text-sm text-gray-700">
                  {[
                    'Implement Dropdown',
                    'Track My Order',
                    'Contact Us',
                    'FAQs',
                    'Help Center',
                    'Return Policy',
                  ].map((item) => (
                    <li
                      key={item}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🛒 Cart */}
        <div className="relative group cursor-pointer">
          <ShoppingCart className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            2
          </span>
        </div>

        {/* 👤 User */}
        <div
          className="relative"
          onMouseEnter={() => setUserOpen(true)}
          onMouseLeave={() => setUserOpen(false)}
        >
          <User className="w-6 h-6 text-[var(--color-brand-primary)] hover:text-blue-600 transition-colors duration-200" />

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute right-0 mt-3 bg-white shadow-2xl rounded-xl overflow-hidden w-52 z-20"
              >
                <ul className="text-sm text-gray-700">
                  {/* Sign In */}
                  <li className="px-4 py-2 font-extrabold text-white bg-[var(--color-accent-navy)] hover:bg-blue-700 cursor-pointer transition-colors duration-150 text-center">
                    Sign In
                  </li>

                  {/* Register */}
                  <li className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-150 text-center">
                    Register
                  </li>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1" />

                  {/* Other Items */}
                  {['My Orders', 'Wishlist', 'Product Reviews'].map((item) => (
                    <li
                      key={item}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
