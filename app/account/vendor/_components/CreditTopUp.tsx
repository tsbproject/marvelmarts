"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Zap,
  CreditCard,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { useNotification } from "@/app/_context/NotificationContext";

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

  const router = useRouter();

  const {
    notifySuccess,
    notifyError,
  } = useNotification();

  const [isProcessing, setIsProcessing] =
    useState<string | null>(null);

  const handlePurchase = async (
    plan: CreditPlan
  ) => {
    if (isProcessing) return;

    try {
      setIsProcessing(plan.id);

      const response = await fetch(
        "/api/vendors/credits/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            data.message ??
            "Unable to initialize payment."
        );
      }

      const redirectUrl =
        data.authorizationUrl ??
        data.url;

      if (!redirectUrl) {
        throw new Error(
          "Payment gateway URL not returned."
        );
      }

      notifySuccess(
        "Redirecting to secure payment..."
      );

      window.location.href =
        redirectUrl;
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : "Unable to initialize payment."
      );

      setIsProcessing(null);
    }
  };

    return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-2">

        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#002B5B]">

          Top-up

          <span className="text-[#F7931E]">
            {" "}
            Credits
          </span>

        </h2>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">

          Replenish your growth engine to stay at the top.

        </p>

      </div>

      {/* ================= CREDIT PLANS ================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {CREDIT_PLANS.map((plan) => (

          <div
            key={plan.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 transition-all hover:border-[#F7931E] hover:shadow-2xl"
          >

            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gray-50 transition-all group-hover:bg-[#F7931E]/10" />

            <div className="relative z-10">

              <div className="mb-8 flex items-center gap-3">

                <div className="rounded-2xl bg-gray-50 p-3 text-[#002B5B] transition-all group-hover:bg-[#002B5B] group-hover:text-[#F7931E]">

                  <Zap
                    size={20}
                    fill="currentColor"
                  />

                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-hover:text-[#002B5B]">

                  {plan.label}

                </span>

              </div>

              <div>

                <div className="flex items-end gap-2">

                  <span className="text-5xl font-black italic tracking-tighter text-[#002B5B]">

                    {plan.credits}

                  </span>

                  <span className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">

                    Credits

                  </span>

                </div>

                <p className="mt-2 text-2xl font-black tracking-tight text-[#F7931E]">

                  ₦{plan.price.toLocaleString()}

                </p>

              </div>

              <p className="mt-6 text-[10px] font-bold uppercase leading-relaxed tracking-wide text-gray-500">

                {plan.description}

              </p>

            </div>

            {/* ================= ACTION ================= */}

            <button
              type="button"
              onClick={() =>
                handlePurchase(plan)
              }
              disabled={
                isProcessing !== null
              }
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#002B5B] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#F7931E] shadow-xl shadow-blue-900/10 transition-all hover:scale-[1.02] hover:bg-[#001f41] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isProcessing === plan.id ? (

                <Loader2
                  size={16}
                  className="animate-spin"
                />

              ) : (

                <>
                  <CreditCard size={14} />

                  Buy Credits
                </>

              )}

            </button>

          </div>

        ))}

      </div>

            {/* ================= STATUS ================= */}

      <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-dashed border-gray-200 py-6 xs:flex-row xs:gap-10">

        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">

          <ShieldCheck
            size={14}
            className="text-green-500"
          />

          Secure Payment Gateway

        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">

          <CheckCircle2
            size={14}
            className="text-[#F7931E]"
          />

          Credits Added Automatically After Confirmation

        </div>

      </div>

    </div>
  );
}