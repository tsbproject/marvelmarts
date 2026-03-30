



"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowRight, MailWarning, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";
import { signIn } from "next-auth/react";

export default function VerifyCustomerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");
  const redirectParam = searchParams.get("redirect") || "";
  const { notifyError, notifySuccess } = useNotification();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; msg: string }>({
    type: "idle",
    msg: "",
  });

  async function handleVerify() {
    if (!uid) {
      const err = "Invalid or expired verification link.";
      setStatus({ type: "error", msg: err });
      notifyError(err);
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", msg: "" });

    try {
      const res = await fetch(`/api/auth/verify/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "Invalid verification code.";
        setStatus({ type: "error", msg: errorMsg });
        notifyError(errorMsg);
      } else {
        const successMsg = "Account Verified. Redirecting to checkout...";
        setStatus({ type: "success", msg: successMsg });
        notifySuccess(successMsg);

        const redirectTarget = redirectParam || "/checkout";

        if (!data?.autoLoginToken) {
          notifyError("Verification succeeded, but auto-login token was not returned.");
          router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
          return;
        }

        const loginRes = await signIn("verified-login", {
          token: data.autoLoginToken,
          redirect: false,
        });

       
        if (loginRes?.error) {
          notifyError("Auto login failed. Please sign in manually.");
          router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTarget)}`);
          return;
        }

        setTimeout(() => {
          router.push(redirectTarget);
        }, 1200);
      }
    } catch {
      const networkErr = "Network error. Please try again.";
      setStatus({ type: "error", msg: networkErr });
      notifyError(networkErr);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!uid) {
      notifyError("Missing verification ID.");
      return;
    }

    setResending(true);

    try {
      const res = await fetch("/api/auth/register/customer/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notifyError(data?.error || data?.message || "Failed to resend code.");
        return;
      }

      notifySuccess(data?.message || "New verification code sent to your email!");
    } catch {
      notifyError("Network error during resend.");
    } finally {
      setResending(false);
    }
  }

  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8F8F8] p-6 text-[#1E1E1E]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#002B5B] rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/20 mb-6">
            <ShieldCheck className="text-[#F7931E]" size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center text-[#002B5B]">
            Verify <span className="text-[#F7931E]">Account.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B4B4B] mt-2">
            Secure Customer Access
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#FFE8CC] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-tight ${
                  status.type === "success" ? "bg-[#FFE8CC] text-[#F7931E]" : "bg-red-50 text-red-600"
                }`}
              >
                {status.type === "success" ? <CheckCircle2 size={16} /> : <MailWarning size={16} />}
                {status.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#4B4B4B] mb-3 block text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="000000"
                className="w-full bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E] rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-0 transition-all text-[#002B5B]"
                disabled={loading || status.type === "success"}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length < 4 || status.type === "success"}
              className="w-full group py-5 bg-[#002B5B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#1E1E1E] disabled:bg-gray-200 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Confirm Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#F7931E]" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="text-[11px] font-black uppercase tracking-widest text-[#002B5B] hover:text-[#F7931E] transition-colors border-b-2 border-[#F7931E] pb-1 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend Verification Link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}