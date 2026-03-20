"use client";

import { useState } from "react";
import {
  Zap,
  CreditCard,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useNotification } from "@/app/_context/NotificationContext";
import { useRouter } from "next/navigation";

interface CreditTopUpProps {
  vendorProfileId: string;
  userEmail: string;
}

type CreditPlan = {
  id: string;
  credits: number;
  price: number;
  label: string;
  description: string;
};

type PaystackSuccessReference = {
  reference: string;
  status?: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
  message?: string;
};

type PaystackConfig = {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  onClose: () => void;
  onSuccess: (reference: PaystackSuccessReference) => void;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
};

const CREDIT_PLANS: CreditPlan[] = [
  {
    id: "starter",
    credits: 15,
    price: 2500,
    label: "Starter Pack",
    description: "Covers a 3-Day boost cycle",
  },
  {
    id: "growth",
    credits: 45,
    price: 6500,
    label: "Growth Pack",
    description: "Enough for a full week of visibility",
  },
  {
    id: "pro",
    credits: 100,
    price: 12000,
    label: "Dominance Pack",
    description: "Best value: Full 30-Day dominance",
  },
];

export default function CreditTopUp({
  vendorProfileId,
  userEmail,
}: CreditTopUpProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  const handlePaymentSuccess = async (
    plan: CreditPlan,
    reference: PaystackSuccessReference
  ) => {
    if (!reference?.reference) {
      notifyError("Payment reference was not received. Please contact support.");
      setIsProcessing(null);
      return;
    }

    setIsProcessing(plan.id);

    try {
      notifySuccess(
        `Payment received for ${plan.credits} credits. Your balance will update shortly after confirmation.`
      );

      setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (error: unknown) {
      console.error("Payment Success Handling Error:", error);
      notifyError(
        "Payment was received, but the dashboard could not refresh immediately."
      );
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePaymentClose = () => {
    setIsProcessing(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#002B5B] italic">
          Top-up <span className="text-[#F7931E]">Credits</span>
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Replenish your growth engine to stay at the top.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {CREDIT_PLANS.map((plan) => {
          const config: PaystackConfig = {
            reference: `boost_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            email: userEmail,
            amount: plan.price * 100,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
            onClose: handlePaymentClose,
            onSuccess: (ref: PaystackSuccessReference) => handlePaymentSuccess(plan, ref),
            metadata: {
              custom_fields: [
                {
                  display_name: "Vendor ID",
                  variable_name: "vendor_id",
                  value: vendorProfileId,
                },
                {
                  display_name: "Credits",
                  variable_name: "credits",
                  value: plan.credits.toString(),
                },
                {
                  display_name: "Plan ID",
                  variable_name: "plan_id",
                  value: plan.id,
                },
              ],
            },
          };

          return (
            <div
              key={plan.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 transition-all hover:border-[#F7931E] hover:shadow-2xl"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gray-50 transition-colors group-hover:bg-[#F7931E]/10" />

              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-2xl bg-gray-50 p-3 text-[#002B5B] transition-all group-hover:bg-[#002B5B] group-hover:text-[#F7931E]">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-hover:text-[#002B5B]">
                    {plan.label}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic tracking-tighter text-[#002B5B]">
                      {plan.credits}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Credits
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-black tracking-tighter text-[#F7931E]">
                    ₦{plan.price.toLocaleString()}
                  </p>
                </div>

                <p className="mb-8 text-[10px] font-bold uppercase leading-relaxed tracking-wide text-gray-500">
                  {plan.description}
                </p>
              </div>

              <PaystackButtonWrapper
                config={config}
                onSuccess={(ref) => handlePaymentSuccess(plan, ref)}
                isLoading={isProcessing === plan.id}
                isDisabled={isProcessing !== null}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-dashed border-gray-200 py-6 xs:flex-row xs:gap-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <ShieldCheck size={14} className="text-green-500" />
          Encrypted By Paystack
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <CheckCircle2 size={14} className="text-[#F7931E]" />
          Verified Credit Update
        </div>
      </div>
    </div>
  );
}

function PaystackButtonWrapper({
  config,
  onSuccess,
  isLoading,
  isDisabled,
}: {
  config: PaystackConfig;
  onSuccess: (ref: any) => void;
  isLoading: boolean;
  isDisabled: boolean;
}) {
  const initializePayment = usePaystackPayment(config);

  return (
    <button
      type="button"
      onClick={() =>
        initializePayment({
          onSuccess,
          onClose: config.onClose,
        })
      }
      disabled={isLoading || isDisabled}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#002B5B] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#F7931E] shadow-xl shadow-blue-900/10 transition-all hover:scale-[1.02] hover:bg-[#001f41] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <>
          <CreditCard size={14} /> Buy Credits
        </>
      )}
    </button>
  );
}