"use client";

import React, { useState, useMemo } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { ArrowLeft, Mail, ShieldQuestion } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

            async function handleSubmit(
              e: React.FormEvent
            ) {

              e.preventDefault();

              // Honeypot
              if (honeypot) return;

              if (!email.trim()) {
                notifyError(
                  "Please enter your email."
                );
                return;
              }

              if (!isEmailValid) {
                notifyError(
                  "Invalid email address."
                );
                return;
              }

              setLoading(true);

              try {

                const normalizedEmail =
                  email.trim().toLowerCase();

                const res = await fetch(
                  "/api/auth/forgot-password",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      email:
                        normalizedEmail,
                    }),
                  }
                );

                const data =
                  await res.json();

                if (
                  res.ok &&
                  data.success
                ) {

                  // Store email for reset page
                  localStorage.setItem(
                    "reset_email",
                    normalizedEmail
                  );

                  notifySuccess(
                    data.message ||
                    "Password reset code sent successfully."
                  );

                  // Redirect to reset page
                  setTimeout(() => {

                    router.push(
                      "/auth/reset-password"
                    );

                  }, 1500);

                  setEmail("");

                } else {

                  notifyError(
                    data.error ||
                    "Failed to process request."
                  );

                }

              } catch (err) {

                notifyError(
                  err instanceof Error
                    ? err.message
                    : "Network error"
                );

              } finally {

                setLoading(false);

              }
            }



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] p-6">
      <div className="w-full max-w-xl bg-[#FFFFFF] rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Decorative Top Section */}
        <div className="bg-[#002B5B] p-10 text-center relative">
          <button 
            onClick={() => router.back()}
            className="absolute left-6 top-10 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F7931E] mb-4 shadow-lg">
            <ShieldQuestion size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Forgot Password?</h1>
          <p className="text-[#FFE8CC] text-sm md:text-base font-medium mt-2">
            No worries, it happens to the best of us.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <p className="text-[#4B4B4B] text-center font-medium mb-10 leading-relaxed">
            Enter the email address associated with your account and we'll send you a secure link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot */}
            <div style={{ display: "none" }}>
              <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                <Mail size={14} className="text-[#F7931E]" /> Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full p-5 text-lg bg-[#F8F8F8] border-2 rounded-2xl outline-none font-bold text-[#1E1E1E] transition-all ${
                    email && !isEmailValid 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-transparent focus:border-[#F7931E]/20 focus:bg-white"
                  }`}
                  placeholder="yourname@example.com"
                />
              </div>
              {!isEmailValid && email && (
                <p className="text-xs font-bold text-red-500 mt-1 ml-1">Please enter a valid email address.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#002B5B] text-[#FFFFFF] rounded-2xl font-black text-xl tracking-tight shadow-xl shadow-[#002B5B]/20 hover:bg-[#1E1E1E] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "SENDING LINK..." : "SEND RESET LINK"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <button 
              onClick={() => router.push('/auth/sign-in')}
              className="text-[#4B4B4B] font-bold hover:text-[#F7931E] transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}