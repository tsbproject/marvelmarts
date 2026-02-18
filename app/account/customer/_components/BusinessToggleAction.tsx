// "use client";

// import { useEffect, useState } from "react";
// import { RefreshCw, ShoppingCart } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { setViewMode } from "@/store/appSlice";
// import { useSession } from "next-auth/react";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
// import { RootState } from "@/store";

// export default function BusinessToggleAction() {
//   const [mounted, setMounted] = useState(false);
//   const dispatch = useDispatch();
//   const { update } = useSession();
//   const { notifySuccess } = useNotification();
//   const { setLoading } = useLoadingOverlay();
  
//   const viewMode = useSelector((state: RootState) => state.app.viewMode);

//   // UseEffect only runs on the client after the first render
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleSwitch = async () => {
//     setLoading(true);
//     const nextMode = viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
    
//     try {
//       // 1. Update Redux (and its internal localStorage logic)
//       dispatch(setViewMode(nextMode));

//       // 2. Update the NextAuth session cookie
//       await update({ role: nextMode });

//       // 3. Essential delay for cookie persistence
//       await new Promise((resolve) => setTimeout(resolve, 200));

//       notifySuccess(nextMode === "VENDOR" ? "Merchant Console Activated" : "Marketplace View Activated");
      
//       // 4. Force hard redirect to ensure Middleware picks up the new role
//       const destination = nextMode === "VENDOR" ? "/account/vendor" : "/";
//       window.location.assign(destination);
      
//     } catch (error) {
//       console.error("Switch error:", error);
//       setLoading(false);
//     }
//   };

//   /**
//    * FIX: Hydration Mismatch
//    * We render a "skeleton" of the button on the server. 
//    * This matches the layout structure so React doesn't complain.
//    */
//   if (!mounted) {
//     return (
//       <button 
//         className="flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md uppercase text-sm tracking-widest border bg-white/10 border-white/20 text-white opacity-50 cursor-not-allowed"
//         disabled
//       >
//         <RefreshCw size={20} className="text-brand-primary opacity-50" />
//         Switching...
//       </button>
//     );
//   }

//   return (
//     <button 
//       onClick={handleSwitch}
//       className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md group uppercase text-sm tracking-widest border
//         ${viewMode === "CUSTOMER" 
//           ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" 
//           : "bg-accent-navy text-white border-accent-navy hover:bg-[#003d82]"
//         }`}
//     >
//       {viewMode === "CUSTOMER" ? (
//         <>
//           <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 text-brand-primary" />
//           Switch to Vendor View
//         </>
//       ) : (
//         <>
//           <ShoppingCart size={20} className="text-brand-primary" />
//           Back to Shopping
//         </>
//       )}
//     </button>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setViewMode } from "@/store/appSlice";
import { useSession } from "next-auth/react";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { RootState } from "@/store";

export default function BusinessToggleAction() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { update } = useSession();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const viewMode = useSelector((state: RootState) => state.app.viewMode);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitch = async () => {
    setLoading(true);
    const nextMode = viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";

    try {
      // 1. Update Redux
      dispatch(setViewMode(nextMode));

      // 2. Update NextAuth session cookie
      await update({ role: nextMode });

      // 3. Delay for cookie persistence
      await new Promise((resolve) => setTimeout(resolve, 200));

      notifySuccess(
        nextMode === "VENDOR"
          ? "Merchant Console Activated"
          : "Marketplace View Activated"
      );

      // 4. Hard redirect so middleware/server-side checks pick up new role
      const destination = nextMode === "VENDOR" ? "/account/vendor" : "/";
      window.location.assign(destination);
    } catch (error) {
      console.error("Switch error:", error);
      setLoading(false);
    }
  };

  /**
   * HYDRATION SYMMETRY LOGIC:
   * The server renders the "Initializing" state. 
   * The client renders the "Initializing" state on the very first frame.
   * Then, useEffect flips 'mounted' to true, and the real viewMode appears.
   * This guarantees the HTML matches exactly at the moment of hydration.
   */
  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md uppercase text-sm tracking-widest border bg-white/10 border-white/20 text-white opacity-50 cursor-not-allowed"
      >
        <RefreshCw size={20} className="animate-spin text-brand-primary opacity-50" />
        Synchronizing...
      </button>
    );
  }

  return (
    <button
      onClick={handleSwitch}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all shadow-xl backdrop-blur-md group uppercase text-sm tracking-widest border
        ${
          viewMode === "CUSTOMER"
            ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
            : "bg-accent-navy text-white border-accent-navy hover:bg-[#003d82]"
        }`}
    >
      {viewMode === "CUSTOMER" ? (
        <>
          <RefreshCw
            size={20}
            className="group-hover:rotate-180 transition-transform duration-500 text-brand-primary"
          />
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
