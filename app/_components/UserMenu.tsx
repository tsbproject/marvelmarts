"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MenuItem {
  label: string;
  type: "auth" | "normal";
  link?: string;
}

interface UserMenuProps {
  open: boolean;       // controlled open state
  onClose: () => void; // callback to close
}

export default function UserMenu({ open, onClose }: UserMenuProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { label: "Sign In", type: "auth", link: "/auth/sign-in" },
    { label: "Register", type: "auth", link: "/auth/register/customer-registration" },
    { label: "My Orders", type: "normal", link: "/orders" },
    { label: "Wishlist", type: "normal", link: "/wishlist" },
    { label: "Product Reviews", type: "normal", link: "/reviews" },
  ];

  const handleClick = (item: MenuItem) => {
    if (item.link) {
      router.push(item.link);
      onClose();
    }
  };

  return (
    <div className="relative">
      {/* Overlay + Menu Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
            />
                <motion.div
                  initial={{ x: "100%", opacity: 0, scale: 0.95 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: "100%", opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.25 }} // delay matches Hamburger exit
                  className="fixed top-0 right-0 h-full w-[80%] max-w-sm 
                            bg-white shadow-2xl z-30 rounded-l-2xl flex flex-col"
>

           
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <User className="w-6 h-6 text-blue-600" />
                  Account
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    onClick={() => handleClick(item)}
                    className={`px-6 py-4 cursor-pointer border-b border-gray-100 
                                transition-all duration-200 text-2xl ${
                                  item.type === "auth"
                                    ? "bg-color-accent-navy text-blue-600 font-semibold hover:bg-blue-50"
                                    : "text-gray-700 hover:bg-gray-100"
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





// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { User, X } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface MenuItem {
//   label: string;
//   type: "auth" | "normal";
//   link?: string;
// }

// interface UserMenuProps {
//   open: boolean;       // controlled open state
//   onClose: () => void; // callback to close
// }

// export default function UserMenu({ open, onClose }: UserMenuProps) {
//   const router = useRouter();

//   const menuItems: MenuItem[] = [
//     { label: "Sign In", type: "auth", link: "/auth/sign-in" },
//     { label: "Register", type: "auth", link: "/auth/register/customer-registration" },
//     { label: "My Orders", type: "normal", link: "/orders" },
//     { label: "Wishlist", type: "normal", link: "/wishlist" },
//     { label: "Product Reviews", type: "normal", link: "/reviews" },
//   ];

//   const handleClick = (item: MenuItem) => {
//     if (item.link) {
//       router.push(item.link);
//       onClose();
//     }
//   };

//   return (
//     <div className="relative">
//       {/* Account button with icon + label in white */}
//       <button
//         onClick={() => {
//           // open the drawer
//           if (!open) {
//             onClose(); // ensure any other menus close first
//           }
//         }}
//         className="flex items-center gap-2 p-2 rounded-full 
//                    text-white hover:text-blue-200 transition-colors duration-200
//                    relative z-10"
//       >
//         <User className="w-8 h-8" />
//         <span className="text-xl font-semibold">Account</span>
//       </button>

//       {/* Overlay + Menu Drawer */}
//       <AnimatePresence>
//         {open && (
//           <>
//             <motion.div
//               className="fixed inset-0 bg-black/40 z-20"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.25 }}
//               onClick={onClose}
//             />

//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", stiffness: 120, damping: 15 }}
//               className="fixed top-0 right-0 h-full w-[80%] max-w-sm 
//                          bg-white shadow-2xl z-30 rounded-l-2xl flex flex-col"
//             >
//               <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
//                 <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
//                   <User className="w-6 h-6 text-blue-600" />
//                   Account
//                 </h2>
//                 <button
//                   onClick={onClose}
//                   className="text-gray-500 hover:text-red-500 transition-colors"
//                 >
//                   <X className="w-8 h-8" />
//                 </button>
//               </div>
//               <ul className="flex-1 overflow-y-auto">
//                 {menuItems.map((item) => (
//                   <li
//                     key={item.label}
//                     onClick={() => handleClick(item)}
//                     className={`px-6 py-4 cursor-pointer border-b border-gray-100 
//                                 transition-all duration-200 text-2xl ${
//                                   item.type === "auth"
//                                     ? "bg-color-accent-navy text-blue-600 font-semibold hover:bg-blue-50"
//                                     : "text-gray-700 hover:bg-gray-100"
//                                 }`}
//                   >
//                     {item.label}
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
