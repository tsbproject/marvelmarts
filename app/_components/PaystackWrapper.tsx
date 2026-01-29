// "use client";

// import { usePaystackPayment } from "react-paystack";
// import { CreditCard } from "lucide-react";

// interface Props {
//   email: string;
//   amount: number;
//   metadata: any;
//   onSuccess: (ref: any) => void;
//   onClose: () => void;
// }

// export default function PaystackWrapper({ email, amount, metadata, onSuccess, onClose }: Props) {
//   const config = {
//     reference: new Date().getTime().toString(),
//     email,
//     amount: Math.round(amount * 100), // Kobo
//     publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
//     metadata
//   };

//   const initializePayment = usePaystackPayment(config);

//   return (
//     <button
//       type="button"
//       onClick={() => initializePayment({ onSuccess, onClose })}
//       className="w-full bg-brand-primary text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.2em] text-2xl hover:bg-accent-navy transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/40 group active:scale-95"
//     >
//       <CreditCard size={32} /> Proceed to Payment
//     </button>
//   );
// }



"use client";

import React from "react";
import { usePaystackPayment } from "react-paystack";
import { CreditCard } from "lucide-react";

export interface PaystackResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  transaction?: string;
}

interface PaystackMetadata {
  custom_fields: Array<{ display_name: string; variable_name: string; value: string }>;
  [key: string]: any;
}

interface PaystackProps {
  email: string;
  amount: number; // in Naira
  metadata?: PaystackMetadata;
  onSuccess: (reference: PaystackResponse) => void | Promise<void>;
  onClose?: () => void;
  buttonLabel?: string;
  className?: string;
}

export default function PaystackWrapper({
  email,
  amount,
  metadata,
  onSuccess,
  onClose,
  buttonLabel = "Proceed to Payment",
  className = "w-full bg-brand-primary text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.2em] text-2xl hover:bg-accent-navy transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/40 group active:scale-95"
}: PaystackProps) {
  const config = {
    reference: new Date().getTime().toString(),
    email: email || "customer@example.com",
    amount: Math.round(amount * 100), // kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    metadata: metadata || { custom_fields: [] },
  };

  const initializePayment = usePaystackPayment(config);

  return (
   <button
      type="button"
      onClick={() => {
        if (!config.publicKey) {
          alert("Paystack Public Key is missing!");
          return;
        }
        initializePayment({ onSuccess, onClose });
      }}
      className="w-full bg-brand-primary text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.2em] text-2xl hover:bg-accent-navy transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/40 group active:scale-95"
    >
      <CreditCard size={32} /> Proceed to Payment
    </button>
  );
}