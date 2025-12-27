"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";

const PASSWORD_POLICY = {
  minLength: 8,
  requireUpper: true,
  requireNumber: true,
  requireSpecial: true,
};

function sanitize(input: string) {
  return input.replace(/[<>'";]/g, "").trim();
}

function validateEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export default function CustomerRegistrationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isPasswordStrong = useMemo(() => {
    return (
      password.length >= PASSWORD_POLICY.minLength &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }, [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (honeypot) return; // Bot detected

    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (!isPasswordStrong) {
      setMessage(
        `Password must be at least ${PASSWORD_POLICY.minLength} characters, include 1 uppercase, 1 number, and 1 special character.`
      );
      return;
    }

    setLoading(true);

    try {
  const res = await fetch("/api/auth/register/customer/send-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Form-Security": "secure-customer-registration-v2",
    },
    body: JSON.stringify({
      name: sanitize(name),
      email: sanitize(email),
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.error || data.details || "Registration failed.");
    setIsSuccess(false);
    setLoading(false);
    return;
  }

  // ✅ Updated message
  setMessage("Verification email sent! Please check your inbox to continue.");
  setIsSuccess(true);

  // ✅ Redirect stays the same
  setTimeout(() => {
    router.push(`/auth/verify/verify-customer?uid=${data.verificationId}`);
  }, 1500);
} catch {
  setMessage("Network error. Please try again.");
  setIsSuccess(false);
}

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <div className="relative w-full px-15 md:min-h-200 max-w-2xl md:max-w-4xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
               
                {/* Back arrow at top-left */}
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="absolute top-4 left-4  flex items-center text-gray-700 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z"/>
                    <path d="M5 12l14 0" />
                    <path d="M5 12l6 6" />
                    <path d="M5 12l6 -6" />
                  </svg>


                  <span className="sr-only">Go back</span>
                </button>


        <h1 className="text-3xl md:text-4xl mt-13 font-bold mb-6 text-center text-gray-800">
          Create Customer Account
        </h1>

         <p className="text-center -mt-5 text-2xl md:text-3xl font-normal text-brand-primary"> Let’s help make this a pleasant experience</p>
       

        {/* Honeypot */}
        <div style={{ display: "none" }}>
          <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {message && (
          <p
            className={`mb-4 text-center text-2xl ${
              isSuccess ? "text-green-600 font-semibold" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div>
            <label className="font-medium  text-xl text-gray-700">Full Name</label>
            <input
              required
              className="w-full p-3 text-xl md:text-4xl border rounded focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="font-medium text-xl text-gray-700">Email</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-xl md:text-4xl border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label className="font-medium text-xl text-gray-700">Password</label>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-xl md:text-4xl border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Strong password"
              />
              <span
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-3 text-xl text-gray-500 cursor-pointer"
              >
                {passwordVisible ? "Hide" : "Show"}
              </span>
            </div>
            <p className="text-xl  text-gray-500 mt-1">
              At least {PASSWORD_POLICY.minLength} chars, 1 uppercase, 1 number, 1 special character
            </p>
          </div>

          <button
            disabled={loading}
            className={`w-full text-2xl md:text-4xl bg-accent-navy text-white p-3 rounded font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-xl text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-blue-600 text-xl font-medium underline">
            Sign in
          </a>
        </p>

        <p className="text-center  text-xl md:text-3xl text-brand-primary mt-2">
          Are you a vendor?{" "}
          <a href="/auth/register/vendor-registration" className="text-accent-navy font-medium underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
