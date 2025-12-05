"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sanitize = (value: string): string => value.replace(/[<>]/g, "").trim();

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

    // fetch session to get role
    const sessionRes = await fetch("/api/auth/session");
    if (!sessionRes.ok) {
      setError("Failed to fetch session");
      setLoading(false);
      return;
    }

    const session: { user?: { id: string; role: string } } = await sessionRes.json();
    let role = session?.user?.role;
    if (role === "user") role = "CUSTOMER";
    if (role) role = role.toUpperCase();

    switch (role) {
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
        setError("Unknown role. Contact support.");
        break;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <p className="mb-4 text-center text-red-600 bg-red-50 py-2 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="••••••••"
              required
            />
            <Link href="/auth/forgot-password" className="text-blue-600 mt-1 inline-block">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-black text-white rounded font-semibold hover:bg-gray-900 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center">
          Don’t have an account?{" "}
          <Link href="/auth/register/customer-registration" className="text-blue-600 font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
