"use client";

import React, {
  useState,
  useEffect,
} from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { useRouter } from "next/navigation";
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

function isPasswordStrong(pw: string): boolean {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

export default function ResetPassword() {
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  const [email, setEmail] = useState("");
      useEffect(() => {

      const storedEmail =
        localStorage.getItem(
          "reset_email"
        );

      if (storedEmail) {
        setEmail(storedEmail);
      }

    }, []);


  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");


async function handleSubmit(
  e: React.FormEvent
) {

  e.preventDefault();

  if (honeypot) {
    return notifyError(
      "Bot detected"
    );
  }

  const cleanEmail =
    sanitizeInput(email);

  const cleanCode =
    sanitizeInput(code);

  const cleanPassword =
    sanitizeInput(newPassword);

  const cleanConfirm =
    sanitizeInput(confirmPassword);

  if (
    !cleanEmail ||
    !cleanCode ||
    !cleanPassword ||
    !cleanConfirm
  ) {
    return notifyError(
      "All fields are required."
    );
  }

  if (
    cleanPassword !==
    cleanConfirm
  ) {
    return notifyError(
      "Passwords do not match."
    );
  }

  if (
    !isPasswordStrong(
      cleanPassword
    )
  ) {
    return notifyError(
      "Password must be stronger (8+ chars, uppercase, number, special char)."
    );
  }

  setLoading(true);

  try {

    const res = await fetch(
      "/api/auth/reset-password",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email:
            cleanEmail,

          code:
            cleanCode,

          newPassword:
            cleanPassword,
        }),
      }
    );

    const data =
      await res.json();

    if (
      res.ok &&
      data.success
    ) {

      // Clear stored reset email
      localStorage.removeItem(
        "reset_email"
      );

      // Clear form
      setCode("");
      setNewPassword("");
      setConfirmPassword("");

      notifySuccess(
        "Password reset successful. Redirecting to login..."
      );

      setTimeout(() => {

        router.push(
          "/auth/sign-in"
        );

      }, 1500);

    } else {

      notifyError(
        data.error ??
        "Reset failed. Please try again."
      );

    }

  } catch {

    notifyError(
      "Network error. Please check your connection."
    );

  } finally {

    setLoading(false);

  }
}



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] p-6">
      <div className="w-full max-w-xl bg-[#FFFFFF] rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-[#002B5B] p-10 text-center relative">
          <button 
            onClick={() => router.push("/auth/sign-in")}
            className="absolute left-6 top-10 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F7931E] mb-4 shadow-lg">
            <KeyRound size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Set New Password</h1>
          <p className="text-[#FFE8CC] text-sm md:text-base font-medium mt-2">
            Secure your account with a fresh password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
          {/* Honeypot */}
          <div style={{ display: "none" }}>
            <input
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
              <Mail size={14} className="text-[#F7931E]" /> Account Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              required
              className="
                w-full
                p-4
                bg-gray-100
                border-2
                border-transparent
                rounded-2xl
                outline-none
                font-bold
                text-[#4B4B4B]
                cursor-not-allowed
              "
            />
                      </div>

          <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                <Lock size={14} className="text-[#F7931E]" />
                Reset Code
              </label>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full p-4 bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E]/20 focus:bg-white rounded-2xl outline-none font-black text-[#1E1E1E] tracking-[0.3em] text-center"
                placeholder="123456"
              />

              <p className="text-xs text-[#4B4B4B] text-center">
                Enter the 6-digit code sent to your email.
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-4 bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E]/20 focus:bg-white rounded-2xl outline-none font-bold text-[#1E1E1E] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1">Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-4 bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E]/20 focus:bg-white rounded-2xl outline-none font-bold text-[#1E1E1E] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-[#FFE8CC] p-4 rounded-xl border border-[#F7931E]/20">
            <p className="text-[10px] font-black uppercase text-[#002B5B] tracking-wider text-center">
              Password must be 8+ chars, including uppercase, number, and symbol.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#002B5B] text-white rounded-2xl font-black text-xl tracking-tight shadow-xl shadow-[#002B5B]/20 hover:bg-[#1E1E1E] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "SAVING CHANGES..." : "RESET PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}
