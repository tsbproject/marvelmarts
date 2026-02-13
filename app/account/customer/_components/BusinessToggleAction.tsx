// "use client";

// import { RefreshCw } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { setViewMode } from "@/store/appSlice";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// export default function BusinessToggleAction() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { notifySuccess } = useNotification();
//   const { setLoading } = useLoadingOverlay();

//   const handleSwitch = () => {
//     setLoading(true);
//     dispatch(setViewMode("VENDOR"));
//     notifySuccess("Merchant Console Activated");
//     router.push("/account/vendor");
//   };

//   return (
//     <button 
//       onClick={handleSwitch}
//       className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md group uppercase text-sm tracking-widest"
//     >
//       <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 text-brand-primary" />
//       Switch to Vendor View
//     </button>
//   );
// }


"use client";

import { RefreshCw, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setViewMode } from "@/store/appSlice";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { RootState } from "@/store";

export default function BusinessToggleAction() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();
  
  // Listen to the current mode to stay in sync with UserMenu
  const viewMode = useSelector((state: RootState) => state.app.viewMode);

  const handleSwitch = () => {
    setLoading(true);
    const nextMode = viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
    
    dispatch(setViewMode(nextMode));
    
    notifySuccess(nextMode === "VENDOR" ? "Merchant Console Activated" : "Marketplace View Activated");
    
    // Push to the correct route based on the NEW mode
    router.push(nextMode === "VENDOR" ? "/account/vendor" : "/");
  };

  return (
    <button 
      onClick={handleSwitch}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md group uppercase text-sm tracking-widest border
        ${viewMode === "CUSTOMER" 
          ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
          : "bg-accent-navy text-white border-accent-navy hover:bg-[#003d82]"
        }`}
    >
      {viewMode === "CUSTOMER" ? (
        <>
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 text-brand-primary" />
          Switch to Vendor View
        </>
      ) : (
        <>
          <ShoppingCart size={20} className="text-brand-primary" />
          Back to Shopping
        </>
      )}
    </button>
  );
}