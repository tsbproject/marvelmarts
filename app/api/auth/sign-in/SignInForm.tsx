"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.refresh();
      router.push("/");
    } else {
      alert("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Sign In
        </h1>

        {error && (
          <p className="mb-4 text-center text-red-600 font-medium bg-red-50 py-2 rounded-lg">
            Authentication failed
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}