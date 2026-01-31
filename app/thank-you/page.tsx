// "use client";

// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux"; 
// import { clearCart } from "@/store/cartSlice"; 
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { CheckCircle2, Package, ArrowRight, Loader2, ShoppingBag } from "lucide-react";



// export default function ThankYouPage() {
//   const searchParams = useSearchParams();
//   const orderId = searchParams.get("orderId");
//   const dispatch = useDispatch(); // 3. Initialize dispatch

//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

//   useEffect(() => {
//     // When the order is successfully confirmed
//     if (status === "success") {
//       dispatch(clearCart()); // 4. Dispatch the action to clear Redux state
//     }
//   }, [status, dispatch]);

//   return (
//     <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 text-center"
//       >
//         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
//           <CheckCircle2 size={40} />
//         </div>

//         <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">
//           Order <span className="text-blue-600">Confirmed</span>
//         </h1>
//         <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
//           Transaction Successful
//         </p>

//         <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
//           <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
//             <span className="text-[10px] font-black uppercase text-gray-400">Order ID</span>
//             <span className="text-xs font-black text-gray-900 truncate ml-4">#{orderId?.slice(-8).toUpperCase()}</span>
//           </div>
//           <p className="text-xs text-gray-500 font-medium leading-relaxed">
//             We've received your payment. Our team is now preparing your MarvelMarts Order for shipment. You will receive an email shortly.
//           </p>
//         </div>

//         <div className="space-y-3">
//           <Link 
//             href="/dashboard/user/orders" 
//             className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
//           >
//             <Package size={16} /> Track My Order
//           </Link>
//           <Link 
//             href="/shop" 
//             className="w-full py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
//           >
//             <ShoppingBag size={16} /> Continue Shopping
//           </Link>
//         </div>
//       </motion.div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/cartSlice";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Package, ArrowRight, Loader2, ShoppingBag } from "lucide-react";

export default function ThankYouPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [verifying, setVerifying] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setVerifying(false);
      return;
    }

    let checkCount = 0;
    const maxChecks = 5; // Try for 10 seconds total

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/verify/${orderId}`);
        const data = await res.json();

        if (data.paid) {
          setIsPaid(true);
          setVerifying(false);
          dispatch(clearCart());
        } else if (checkCount < maxChecks) {
          checkCount++;
          setTimeout(checkStatus, 2000); // Check again in 2 seconds
        } else {
          setVerifying(false); // Stop trying after 10s
        }
      } catch (err) {
        console.error("Verification error:", err);
        setVerifying(false);
      }
    };

    checkStatus();
  }, [orderId, dispatch]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <h2 className="font-black uppercase italic tracking-tighter">Securing your order...</h2>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="text-red-500 mb-4" size={60} />
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Payment Not Confirmed</h1>
        <p className="text-gray-500 max-w-sm mt-2">We haven't received confirmation from Paystack yet. If you've been debited, please contact MarvelMarts support.</p>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 text-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">
          Order <span className="text-blue-600">Confirmed</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
          Transaction Successful
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <span className="text-[10px] font-black uppercase text-gray-400">Order ID</span>
            <span className="text-xs font-black text-gray-900 truncate ml-4">#{orderId?.slice(-8).toUpperCase()}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            We've received your payment. Our team is now preparing your MarvelMarts Order for shipment. You will receive an email shortly.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/dashboard/user/orders" 
            className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
          >
            <Package size={16} /> Track My Order
          </Link>
          <Link 
            href="/shop" 
            className="w-full py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}