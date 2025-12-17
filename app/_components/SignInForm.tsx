// app/auth/sign-in/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sanitizedId = sanitize(identifier);
    if (!sanitizedId || !password) {
      setError("Email/Username and password are required");
      setLoading(false);
      return;
    }

    // ✅ Use NextAuth signIn
    const res = await signIn("credentials", {
      redirect: false,
      identifier: sanitizedId,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    // ✅ Get hydrated session with role
    const session = await getSession();
    const userRole = session?.user?.role;

    if (!userRole) {
      setError("Unable to determine role");
      setLoading(false);
      return;
    }

    switch (userRole.toUpperCase()) {
      case "SUPER_ADMIN":
      case "ADMIN":
        router.push("/dashboard/admins");
        break;
      case "VENDOR":
        router.push("/account/vendor");
        break;
      case "CUSTOMER":
        router.push("/account/customer");
        break;
      default:
        setError("Unknown role");
        break;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl border border-brand-dark shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <p className="mb-4 text-center text-red-600 bg-red-50 py-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-2xl font-medium">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full text-xl p-3 border rounded"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-2xl font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl p-3 border rounded pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  // 👁 Show password icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  // 🚫 Hide password icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.03-3.278 3.44-5.827 6.458-6.708M9.88 9.88a3 3 0 104.243 4.243"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-blue-600 mt-1 text-xl inline-block"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-2xl bg-accent-navy text-white rounded font-semibold hover:bg-gray-900 ${
              loading ? "opacity-70 cursor-not-allowed flex items-center justify-center" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-6 w-6 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            href="/auth/register/customer-registration"
            className="text-blue-600 text-xl font-semibold"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
