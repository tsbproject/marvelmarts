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
  Settings,
  MapPin,
  Store,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { useDispatch, useSelector } from "react-redux";
import { useNotification } from "@/app/_context/NotificationContext";
import { RootState } from "@/store";
import { setViewMode } from "@/store/appSlice";

interface MenuItem {
  label: string;
  link: string;
  icon: React.ReactNode;
  variant?: "special" | "switcher"; 
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
  
  const { status, data: session } = useSession();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Workspace Toggle State
  const viewMode = useSelector((state: RootState) => state.app?.viewMode || "CUSTOMER");
  const isActualVendor = session?.user?.role === "VENDOR" || session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const isLoading = status === "loading";

  // Build Dynamic Menu Items
  const menuItems: MenuItem[] = viewMode === "VENDOR" ? [
    { label: "Vendor Dashboard", link: "/account/vendor/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Manage Products", link: "/account/vendor/products", icon: <Store size={20} /> },
    { label: "Store Orders", link: "/account/vendor/orders", icon: <ShoppingBag size={20} /> },
    { label: "Store Settings", link: "/account/vendor/settings", icon: <Settings size={20} /> },
  ] : [
    { label: "My Dashboard", link: "/account/customer", icon: <Settings size={20} /> },
    { label: "My Orders", link: "/account/customer/orders", icon: <ShoppingBag size={20} /> },
    { label: "Wishlist", link: "/account/customer/wishlist", icon: <Heart size={20} /> },
    { label: "Product Reviews", link: "/reviews", icon: <Star size={20} /> },
    { label: "Addresses", link: "/addresses", icon: <MapPin size={20} /> },
    { label: "Account Details", link: "/account-details", icon: <UserIcon size={20} /> },
  ];

  // Add the Switcher or Registration link
  if (isActualVendor) {
    menuItems.push({
      label: viewMode === "CUSTOMER" ? "Switch to Vendor Mode" : "Switch to Shopping Mode",
      link: "toggle_workspace",
      icon: <RefreshCw size={20} />,
      variant: "switcher"
    });
  } else {
    menuItems.push({ 
      label: "Become A Vendor", 
      link: "/auth/register/vendor-registration", 
      icon: <Store size={20} />,
      variant: "special" 
    });
  }

  const handleClick = (item: MenuItem | { link: string }) => {
    if ('variant' in item && item.variant === "switcher") {
      const nextMode = viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
      
      // Sync Redux State
      dispatch(setViewMode(nextMode));
      
      notifySuccess(`Switched to ${nextMode} view`);
      onClose();
      setLoading(true);
      
      // Redirect based on the mode we just switched TO
      router.push(nextMode === "VENDOR" ? "/account/vendor" : "/");
      return;
    }

    onClose();
    setLoading(true);

    const isVendorRegistration = item.link === "/auth/register/vendor-registration";
    const isSignInPage = item.link === "/auth/sign-in";

    if (!isAuthenticated && !isVendorRegistration && !isSignInPage) {
      router.push("/auth/sign-in");
    } else {
      router.push(item.link);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    dispatch({ type: "auth/logout" });
    notifySuccess("Security Protocol: Session Terminated.");
    await signOut({ callbackUrl: "/" });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[90%] max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                  MarvelMarts<span className="text-orange-500">.</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {viewMode === "VENDOR" ? "Merchant Console" : "Account Menu"}
                </p>
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
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {isAuthenticated ? "Account Status" : "Welcome"}
                </p>

                {isLoading ? (
                  <div className="w-full h-32 bg-gray-50 rounded-4xl animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#002B5B] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="p-6 rounded-4xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-lg text-white transition-colors ${viewMode === 'VENDOR' ? 'bg-orange-600' : 'bg-[#002B5B]'}`}>
                        <UserIcon size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                          {viewMode === "VENDOR" ? "Merchant Active" : "Logged in as"}
                        </p>
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
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClick({ link: "/auth/sign-in" })}
                    className="group cursor-pointer p-6 rounded-4xl bg-[#002B5B] text-white shadow-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <LogIn size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg leading-tight">Sign In</p>
                        <p className="text-xs text-orange-200 font-medium">Access your account</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-orange-300 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </div>

              {/* General Links */}
              <div className="space-y-4 pb-8">
                <p className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {viewMode === "VENDOR" ? "Business Management" : "Dashboard"}
                </p>
                <div className="grid gap-2">
                  {menuItems.map((item, index) => {
                    const isSpecial = item.variant === "special";
                    const isSwitcher = item.variant === "switcher";
                    
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleClick(item)}
                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all border cursor-pointer
                          ${isSpecial 
                            ? "bg-orange-50 border-orange-200 hover:bg-orange-100 shadow-sm" 
                            : isSwitcher
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm mt-4"
                            : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 transition-colors 
                            ${isSpecial ? "text-orange-600" : isSwitcher ? "text-blue-600 animate-pulse" : "text-gray-400 group-hover:text-[#002B5B]"}`}>
                            {item.icon}
                          </div>
                          <span className={`text-lg font-bold uppercase tracking-tight
                            ${isSpecial ? "text-orange-700" : isSwitcher ? "text-accent-navy" : "text-gray-700"}`}>
                            {item.label}
                          </span>
                        </div>
                        {isSpecial && (
                          <span className="px-2 py-1 bg-orange-600 text-[8px] font-black text-white rounded-md uppercase tracking-tighter animate-pulse">
                            New
                          </span>
                        )}
                        <ChevronRight size={14} className={`transition-all
                          ${(isSpecial || isSwitcher) ? "text-orange-400" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} 
                        />
                      </motion.div>
                    );
                  })}
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