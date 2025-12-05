"use client";

import React, { useState, useMemo } from "react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function ForgotPassword() {
  const { notifySuccess, notifyError } = useNotification();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return; // bot detected

    if (!email.trim()) {
      notifyError("Please enter your email.");
      return;
    }

    if (!isEmailValid) {
      notifyError("Invalid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        notifySuccess(data.message || "If the email exists, a reset link will be sent.");
        setEmail("");
      } else {
        notifyError(data.error || "Failed to process request.");
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot */}
          <div style={{ display: "none" }}>
            <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-1 block w-full rounded-md border ${
                email && !isEmailValid ? "border-red-400" : "border-gray-300"
              } shadow-sm focus:border-black focus:ring-black/10 p-3`}
              placeholder="you@example.com"
            />
            {!isEmailValid && email && (
              <p className="text-xs text-red-500 mt-1">Enter a valid email.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white font-semibold py-3 hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Sending link…" : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
