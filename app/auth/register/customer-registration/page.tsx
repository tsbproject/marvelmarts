

"use client";

import React, { useMemo, useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext";

interface CustomerFormData {
  name: string;
  email: string;
  password: string;
  honeypot?: string;
}

const PASSWORD_POLICY = {
  minLength: 8,
  requireUpper: true,
  requireNumber: true,
};

function sanitize(input: string) {
  return input.replace(/[<>]/g, "").trim();
}

function calcPasswordScore(pw: string) {
  let score = 0;
  if (pw.length >= PASSWORD_POLICY.minLength) score += 30;
  if (/[A-Z]/.test(pw)) score += 30;
  if (/\d/.test(pw)) score += 30;
  if (/[^A-Za-z0-9]/.test(pw)) score += 10;
  return Math.min(100, score);
}

export default function CustomerRegistration(): JSX.Element {
  const { notifySuccess, notifyError } = useNotification();

  const [form, setForm] = useState<CustomerFormData>({
    name: "",
    email: "",
    password: "",
    honeypot: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email]
  );

  const isPasswordStrong = useMemo(() => {
    const pw = form.password;
    return (
      pw.length >= PASSWORD_POLICY.minLength &&
      /[A-Z]/.test(pw) &&
      /\d/.test(pw)
    );
  }, [form.password]);

  function updateField<K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) {
    setForm((s) => ({ ...s, [key]: value }));

    if (key === "password") {
      setPasswordScore(calcPasswordScore(String(value)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.honeypot) return;

    if (!form.name.trim() || !form.email.trim()) {
      notifyError("Please complete all fields.");
      return;
    }

    if (!isEmailValid) {
      notifyError("Invalid email address.");
      return;
    }

    if (!isPasswordStrong) {
      notifyError(
        `Password must be at least ${PASSWORD_POLICY.minLength} characters, include 1 uppercase letter and 1 number.`
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: sanitize(form.name),
        email: sanitize(form.email).toLowerCase(),
        password: form.password,
      };

      const res = await fetch("/api/auth/register/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Form-Security": "customer-registration-v1"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        notifySuccess("Account created successfully! You may now sign in.");
        setForm({ name: "", email: "", password: "", honeypot: "" });
        setPasswordScore(0);
        return;
      }

      notifyError(data.error || "Registration failed.");
    } catch {
      notifyError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg px-8 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Create Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Passwords are securely hashed using industry-grade encryption.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Honeypot */}
          <div style={{ display: "none" }}>
            <input
              name="honeypot"
              value={form.honeypot}
              onChange={(e) => updateField("honeypot", e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 p-3"
              placeholder="Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className={`mt-1 block w-full rounded-md border ${
                isEmailValid ? "border-gray-300" : "border-red-400"
              } shadow-sm focus:border-black focus:ring-black/10 p-3`}
              placeholder="you@example.com"
            />
            {!isEmailValid && form.email && (
              <p className="text-xs text-red-500 mt-1">Enter a valid email.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>

            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 p-3"
                placeholder="Strong password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-2 text-sm text-gray-500 select-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password strength bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-100 h-2 rounded">
                <div
                  className={`h-2 rounded transition-all ${
                    passwordScore < 40
                      ? "bg-red-500"
                      : passwordScore < 70
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${passwordScore}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white font-semibold py-3 hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
