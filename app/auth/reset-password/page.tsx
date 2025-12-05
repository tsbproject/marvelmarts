// /app/auth/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";

interface ResetForm {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [form, setForm] = useState<ResetForm>({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Pre-fill email from URL query
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setForm((prev) => ({ ...prev, email: sanitize(email) }));
    }
  }, [searchParams]);

  // Basic sanitization
  const sanitize = (value: string): string => {
    return value.replace(/[<>$"'`]/g, "").trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: sanitize(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Lockout check
    if (lockedUntil && Date.now() < lockedUntil) {
      notifyError("Too many attempts. Please wait a moment.");
      return;
    }

    // Validate fields
    if (!form.email || !form.code || !form.password || !form.confirmPassword) {
      notifyError("Please fill in all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      notifyError("Invalid email format");
      return;
    }

    if (form.password !== form.confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      notifyError("Password must be at least 8 characters");
      return;
    }

    notifyInfo("Processing request...");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // ✅ FIXED: send newPassword instead of password
        body: JSON.stringify({
          email: form.email,
          code: form.code,
          newPassword: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error || "Failed to reset password");
        setLockedUntil(Date.now() + 3000);
        setLoading(false);
        return;
      }

      notifySuccess(data.message || "Password reset successful");

      setLoading(false);
      router.push("/auth/sign-in");
    } catch (err) {
      console.error(err);
      notifyError("Internal server error");
      setLockedUntil(Date.now() + 3000);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Reset Your Password
        </h2>

        {/* EMAIL */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your email"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        {/* CODE */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Reset Code</span>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Enter the code from email"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        {/* PASSWORD */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">New Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New password"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        {/* CONFIRM */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
