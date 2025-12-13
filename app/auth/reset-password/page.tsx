"use client";

import React, { useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { useRouter } from "next/navigation";

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
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // ✅ added honeypot state

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return notifyError("Bot detected");

    const cleanEmail = sanitizeInput(email);
    const cleanCode = sanitizeInput(code);
    const cleanPassword = sanitizeInput(newPassword);
    const cleanConfirm = sanitizeInput(confirmPassword);

    if (!cleanEmail || !cleanCode || !cleanPassword || !cleanConfirm) {
      return notifyError("All fields are required.");
    }

    if (cleanPassword !== cleanConfirm) {
      return notifyError("Passwords do not match.");
    }

    if (!isPasswordStrong(cleanPassword)) {
      return notifyError(
        "Password must be stronger (8+ chars, uppercase, number, special char)."
      );
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          newPassword: cleanPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notifySuccess("Password reset successful. Redirecting to login…");
        setTimeout(() => router.push("/auth/sign-in"), 1500);
      } else {
        notifyError(data.error ?? "Reset failed. Please try again.");
      }
    } catch {
      notifyError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email, the reset code you received, and your new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot hidden field */}
          <div style={{ display: "none" }}>
            <input
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div>
            <label>Reset Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white font-semibold py-3 hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
