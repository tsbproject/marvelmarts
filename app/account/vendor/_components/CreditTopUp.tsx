// "use client";

// import { useState } from "react";
// import { Zap, CreditCard, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
// import { usePaystackPayment } from "react-paystack";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { addCreditsToVendor } from "@/app/_actions/boostActions";
// import { useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { updateCredits } from "@/store/vendorSlice";

// interface PaystackWrapperProps {
//   config: any;
//   onSuccess: (reference: any) => void;
//   onClose: () => void;
//   isLoading: boolean;
// }

// interface CreditTopUpProps {
//   vendorProfileId: string;
//   userEmail: string;
// }

// const CREDIT_PLANS = [
//   { id: 'starter', credits: 20, price: 5000, label: "Starter Pack", description: "Perfect for testing boosts" },
//   { id: 'growth', credits: 50, price: 10000, label: "Growth Pack", description: "Most popular for active sellers" },
//   { id: 'pro', credits: 150, price: 25000, label: "Dominance Pack", description: "Best value for major visibility" },
// ];

// export default function CreditTopUp({ vendorProfileId, userEmail }: CreditTopUpProps) {
//   const [isProcessing, setIsProcessing] = useState<string | null>(null);
//   const { notifySuccess, notifyError } = useNotification();
//   const router = useRouter();

//   const dispatch = useDispatch();

//   const handlePaymentSuccess = async (plan: typeof CREDIT_PLANS[0], reference: any) => {
//     setIsProcessing(plan.id);
    
//     try {
//       // Call Server Action to verify and add credits
//       const result = await addCreditsToVendor(vendorProfileId, plan.credits, reference.reference);


//       if (result.success && result.newBalance !== undefined) {
//       // 1. Update Global Redux State (Immediate UI feedback for Header/Sidebar)
//       dispatch(updateCredits(result.newBalance));

//       // 2. Notify the user with the fresh balance
//       notifySuccess(`Successfully added ${plan.credits} credits! New balance: ${result.newBalance}`);
      
//       // 3. Refresh Server Components (Syncs any DB-driven UI)
//       router.refresh();
//     } else {
//       notifyError(result.error || "Something went wrong during credit sync.");
//     }
//   } catch (error) {
//     console.error("Payment Sync Error:", error);
//     notifyError("Connection failed. Please check your dashboard in a moment.");
//   } finally {
//     setIsProcessing(null);
//   }
// };
//   const handlePaymentClose = () => {
//     setIsProcessing(null);
//   };

//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col gap-2">
//         <h2 className="text-2xl font-black uppercase tracking-tight text-accent-navy">
//           Top-up <span className="text-blue-600">Credits</span>
//         </h2>
//         <p className="text-sm text-gray-500 font-medium">
//           Purchase credits to boost your products to the top of trending carousels and search results.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {CREDIT_PLANS.map((plan) => {
//           // Metadata remains the same for Paystack dashboard tracking
//           const config = {
//             reference: `boost_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
//             email: userEmail,
//             amount: plan.price * 100, 
//             publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
//             metadata: {
//               custom_fields: [
//                 { display_name: "Vendor ID", variable_name: "vendor_id", value: vendorProfileId },
//                 { display_name: "Credits", variable_name: "credits", value: plan.credits.toString() }
//               ]
//             }
//           };

//           return (
//             <div 
//               key={plan.id} 
//               className="relative group bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:border-blue-500 flex flex-col justify-between overflow-hidden"
//             >
//               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-600/10 transition-colors" />

//               <div>
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
//                     <Zap size={20} fill="currentColor" />
//                   </div>
//                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
//                     {plan.label}
//                   </span>
//                 </div>

//                 <div className="mb-6">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-4xl font-black text-accent-navy italic tracking-tighter">
//                       {plan.credits}
//                     </span>
//                     <span className="text-xs font-black uppercase tracking-widest text-gray-400">Credits</span>
//                   </div>
//                   <p className="text-lg font-bold text-blue-600 mt-1">
//                     ₦{plan.price.toLocaleString()}
//                   </p>
//                 </div>

//                 <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
//                   {plan.description}
//                 </p>
//               </div>

//               <PaystackButtonWrapper 
//                 config={config} 
//                 onSuccess={(ref: any) => handlePaymentSuccess(plan, ref)}
//                 onClose={handlePaymentClose}
//                 isLoading={isProcessing === plan.id}
//               />
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100 mt-10">
//         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
//           <ShieldCheck size={14} className="text-green-500" /> Secure Payments by Paystack
//         </div>
//         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
//           <CheckCircle2 size={14} className="text-blue-500" /> Instant Delivery
//         </div>
//       </div>
//     </div>
//   );
// }

// function PaystackButtonWrapper({ config, onSuccess, onClose, isLoading }: any) {
//   const initializePayment = usePaystackPayment(config);

//   return (
//     <button
//       onClick={() => initializePayment(onSuccess, onClose)}
//       disabled={isLoading}
//       className="w-full py-4 bg-accent-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10"
//     >
//       {isLoading ? (
//         <Loader2 className="animate-spin" size={16} />
//       ) : (
//         <>
//           <CreditCard size={14} /> Buy Credits Now
//         </>
//       )}
//     </button>
//   );
// }




"use client";

import { useState } from "react";
import { Zap, CreditCard, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useNotification } from "@/app/_context/NotificationContext";
import { addCreditsToVendor } from "@/app/_actions/boostActions";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateCredits } from "@/store/vendorSlice";

interface CreditTopUpProps {
  vendorProfileId: string;
  userEmail: string;
}

const CREDIT_PLANS = [
  { id: 'starter', credits: 20, price: 5000, label: "Starter Pack", description: "Perfect for testing boosts" },
  { id: 'growth', credits: 50, price: 10000, label: "Growth Pack", description: "Most popular for active sellers" },
  { id: 'pro', credits: 150, price: 25000, label: "Dominance Pack", description: "Best value for major visibility" },
];

export default function CreditTopUp({ vendorProfileId, userEmail }: CreditTopUpProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();
  const dispatch = useDispatch();

  const handlePaymentSuccess = async (plan: typeof CREDIT_PLANS[0], reference: any) => {
    setIsProcessing(plan.id);
    
    try {
      const result = await addCreditsToVendor(vendorProfileId, plan.credits, reference.reference);

      if (result.success && result.newBalance !== undefined) {
        // 1. Update Global Redux State immediately
        dispatch(updateCredits(result.newBalance));

        // 2. Notify the user
        notifySuccess(`Successfully added ${plan.credits} credits! New balance: ${result.newBalance}`);
        
        // 3. Sync Server Components
        router.refresh();
      } else {
        notifyError(result.error || "Something went wrong during credit sync.");
      }
    } catch (error) {
      console.error("Payment Sync Error:", error);
      notifyError("Connection failed. Please check your dashboard in a moment.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePaymentClose = () => {
    setIsProcessing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-accent-navy">
          Top-up <span className="text-blue-600">Credits</span>
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Purchase credits to boost your products to the top of trending carousels and search results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PLANS.map((plan) => {
          const config = {
            reference: `boost_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            email: userEmail,
            amount: plan.price * 100, 
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
            // Move onClose here to fix the "Expected 1 argument" error
            onClose: handlePaymentClose,
            metadata: {
              custom_fields: [
                { display_name: "Vendor ID", variable_name: "vendor_id", value: vendorProfileId },
                { display_name: "Credits", variable_name: "credits", value: plan.credits.toString() }
              ]
            }
          };

          return (
            <div 
              key={plan.id} 
              className="relative group bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:border-blue-500 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-600/10 transition-colors" />

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                    {plan.label}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-accent-navy italic tracking-tighter">
                      {plan.credits}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Credits</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    ₦{plan.price.toLocaleString()}
                  </p>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
                  {plan.description}
                </p>
              </div>

              <PaystackButtonWrapper 
                config={config} 
                onSuccess={(ref: any) => handlePaymentSuccess(plan, ref)}
                isLoading={isProcessing === plan.id}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100 mt-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <ShieldCheck size={14} className="text-green-500" /> Secure Payments by Paystack
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <CheckCircle2 size={14} className="text-blue-500" /> Instant Delivery
        </div>
      </div>
    </div>
  );
}

function PaystackButtonWrapper({ config, onSuccess, isLoading }: { config: any, onSuccess: (ref: any) => void, isLoading: boolean }) {
  const initializePayment = usePaystackPayment(config);

  return (
    <button
      type="button"
      onClick={() => {
        // Fixed: Only passing one argument because onClose is in the config
        initializePayment(onSuccess as any);
      }}
      disabled={isLoading}
      className="w-full py-4 bg-accent-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <>
          <CreditCard size={14} /> Buy Credits Now
        </>
      )}
    </button>
  );
}