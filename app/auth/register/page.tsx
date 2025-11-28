"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Account created successfully");
      router.push("/auth/sign-in");
    } else {
      const data = await res.json();
      alert(data.error || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">

        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Create Your Account
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-black focus:border-black 
                         bg-gray-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-black focus:border-black 
                         bg-gray-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-black focus:border-black 
                         bg-gray-50 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-medium 
                       hover:bg-gray-900 transition active:scale-95"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-black font-semibold underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
