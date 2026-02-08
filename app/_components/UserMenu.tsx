// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   User, 
//   X, 
//   ShoppingBag, 
//   Heart, 
//   Star, 
//   LogIn, 
//   LogOut,
//   ChevronRight,
//   ShieldCheck, 
//   Settings 
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// interface MenuItem {
//   label: string;
//   type: "auth" | "normal";
//   link?: string;
//   icon: React.ReactNode;
// }

// interface UserMenuProps {
//   open: boolean;
//   onClose: () => void;
// }

// export default function UserMenu({ open, onClose }: UserMenuProps) {
//   const router = useRouter();
//   const { data: session, status } = useSession(); 
//   const { setLoading } = useLoadingOverlay();

//   // status can be "loading", "authenticated", or "unauthenticated"
//   const isLoading = status === "loading";

//   const menuItems: MenuItem[] = [
//     { label: "My Orders", type: "normal", link: "/account/customer/orders", icon: <ShoppingBag size={20} /> },
//     { label: "Wishlist", type: "normal", link: "/account/customer/wishlist", icon: <Heart size={20} /> },
//     { label: "Product Reviews", type: "normal", link: "/reviews", icon: <Star size={20} /> },
//     { label: "Account Settings", type: "normal", link: "/account/customer/profile", icon: <Settings size={20} /> },
//   ];

//   const handleClick = (item: Partial<MenuItem>) => {
//     if (item.link) {
//       setLoading(true);
//       router.push(item.link);
//       onClose();
//     }
//   };

//   const handleLogout = async () => {
//     setLoading(true);
//     // callbackUrl: "/" ensures the user is sent back to the homepage after clearing session
//     await signOut({ callbackUrl: "/" });
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* Backdrop with Blur */}
//           <motion.div
//             className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-100"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           {/* Side Drawer */}
//           <motion.div
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//             className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-101 flex flex-col"
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-6 py-8">
//               <div>
//                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
//                   MarvelMarts<span className="text-indigo-600">.</span>
//                 </h2>
//                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Menu</p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-3 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Content */}
//             <div className="flex-1 px-6 space-y-8 overflow-y-auto">
              
//               {/* Auth Section */}
//               <div className="space-y-4">
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
//                   {session ? "Account Status" : "Welcome"}
//                 </p>

//                 {isLoading ? (
//                   /* SKELETON LOADER - Prevents layout jump while checking session */
//                   <div className="w-full h-32 bg-gray-50 rounded-4xl animate-pulse flex items-center justify-center">
//                     <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 ) : session ? (
//                   /* LOGGED IN VIEW */
//                   <div className="space-y-3">
//                     <div className="p-6 rounded-4xl bg-gray-50 border border-gray-100 flex items-center gap-4">
//                       <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
//                         <User size={24} />
//                       </div>
//                       <div className="overflow-hidden">
//                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Logged in as</p>
//                         <p className="font-black text-gray-900 truncate uppercase tracking-tight">
//                           {session.user?.name || session.user?.email?.split('@')[0]}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <motion.button 
//                       whileTap={{ scale: 0.95 }}
//                       onClick={handleLogout}
//                       className="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
//                     >
//                       <LogOut size={18} />
//                       Sign Out
//                     </motion.button>
//                   </div>
//                 ) : (
//                   /* LOGGED OUT VIEW */
//                   <motion.div 
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => handleClick({ link: "/auth/sign-in" })}
//                     className="group cursor-pointer p-6 rounded-4xl bg-accent-navy text-white shadow-xl shadow-indigo-200 flex items-center justify-between"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-white/20 rounded-xl">
//                         <LogIn size={24} />
//                       </div>
//                       <div>
//                         <p className="font-black text-lg leading-tight">Sign In</p>
//                         <p className="text-xs text-indigo-100 font-medium">Access your account</p>
//                       </div>
//                     </div>
//                     <ChevronRight size={20} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
//                   </motion.div>
//                 )}
//               </div>

//               {/* General Links */}
//               <div className="space-y-4 pb-8">
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Dashboard</p>
//                 <div className="grid gap-2">
//                   {menuItems.map((item, index) => (
//                     <motion.div
//                       key={item.label}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       onClick={() => handleClick(item)}
//                       className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="p-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
//                           {item.icon}
//                         </div>
//                         <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">
//                           {item.label}
//                         </span>
//                       </div>
//                       <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
//                     </motion.div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="p-8 border-t border-gray-50">
//               <div className="flex items-center gap-3 text-gray-400">
//                 <div className="p-2 bg-gray-50 rounded-lg">
//                   <ShieldCheck size={16} />
//                 </div>
//                 <p className="text-[9px] font-bold uppercase tracking-widest">Secure Shopping Guaranteed</p>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }



"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  X, 
  ShoppingBag, 
  Heart, 
  Star, 
  LogIn, 
  LogOut,
  ChevronRight,
  ShieldCheck, 
  Settings 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "@/app/_context/NotificationContext";
import { RootState } from "@/store";

interface MenuItem {
  label: string;
  type: "auth" | "normal";
  link?: string;
  icon: React.ReactNode;
}

interface UserMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function UserMenu({ open, onClose }: UserMenuProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();
  
  // Get session status for the skeleton loader
  const { status } = useSession();

  // INSTANT UPDATE: Use Redux as the primary source of truth for the UI
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isLoading = status === "loading";

  const menuItems: MenuItem[] = [
    { label: "My Orders", type: "normal", link: "/account/customer/orders", icon: <ShoppingBag size={20} /> },
    { label: "Wishlist", type: "normal", link: "/account/customer/wishlist", icon: <Heart size={20} /> },
    { label: "Product Reviews", type: "normal", link: "/reviews", icon: <Star size={20} /> },
    { label: "Account Settings", type: "normal", link: "/account/customer/profile", icon: <Settings size={20} /> },
  ];

  const handleClick = (item: Partial<MenuItem>) => {
    if (item.link) {
      setLoading(true);
      router.push(item.link);
      onClose();
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    
    // 1. Unified Redux Reset (Triggers Root Reducer in store/index.ts)
    dispatch({ type: "auth/logout" });

    // 2. Marvel Success Notification
    notifySuccess("Security Protocol: Session Terminated.");

    // 3. Next-Auth Sign Out
    await signOut({ callbackUrl: "/" });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-101 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                  MarvelMarts<span className="text-indigo-600">.</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Menu</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 space-y-8 overflow-y-auto">
              
              {/* Auth Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {isAuthenticated ? "Account Status" : "Welcome"}
                </p>

                {isLoading ? (
                  /* SKELETON LOADER */
                  <div className="w-full h-32 bg-gray-50 rounded-4xl animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : isAuthenticated ? (
                  /* LOGGED IN VIEW - Updates instantly via Redux */
                  <div className="space-y-3">
                    <div className="p-6 rounded-4xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                        <UserIcon size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Logged in as</p>
                        <p className="font-black text-gray-900 truncate uppercase tracking-tight">
                          {user?.name || user?.email?.split('@')[0]}
                        </p>
                      </div>
                    </div>
                    
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  /* LOGGED OUT VIEW */
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClick({ link: "/auth/sign-in" })}
                    className="group cursor-pointer p-6 rounded-4xl bg-accent-navy text-white shadow-xl shadow-indigo-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <LogIn size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg leading-tight">Sign In</p>
                        <p className="text-xs text-indigo-100 font-medium">Access your account</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </div>

              {/* General Links */}
              <div className="space-y-4 pb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Dashboard</p>
                <div className="grid gap-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleClick(item)}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-50">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest">Secure Shopping Guaranteed</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}