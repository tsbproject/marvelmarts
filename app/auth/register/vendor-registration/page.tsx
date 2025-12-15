"use client";

import { useState, useMemo } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { z } from "zod";
import { useRouter } from "next/navigation";

// ---------------------------------
// Nigeria States + FCT Abuja
// ---------------------------------
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja",
];

// ------------------------
// Zod schema
// ------------------------
const vendorSchema = z
  .object({
    email: z.string().email("Invalid email"),
    verificationCode: z.string().min(4, "Enter verification code"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    storeName: z.string().min(1, "Store name is required"),
    storePhone: z.string().min(10, "Enter valid phone number"),
    storeAddress: z.string().min(5, "Store address required"),
    country: z.string().min(1, "Country required"),
    state: z.string().min(1, "State required"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    agree: z.boolean().refine(val => val === true, {
      message: "You must agree to terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type VendorFormData = z.infer<typeof vendorSchema>;


// -----------------------------
// Password utilities
// -----------------------------
const PASSWORD_POLICY = {
  minLength: 6,
  requireUpper: true,
  requireNumber: true,
};

function calcPasswordScore(pw: string): number {
  let score = 0;
  if (pw.length >= PASSWORD_POLICY.minLength) score += 30;
  if (/[A-Z]/.test(pw)) score += 30;
  if (/\d/.test(pw)) score += 30;
  if (/[^A-Za-z0-9]/.test(pw)) score += 10;
  return Math.min(100, score);
}

function sanitize(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

// -----------------------------
// Component
// -----------------------------
export default function VendorRegistration() {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotification();
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<VendorFormData>({
    email: "",
    verificationCode: "",
    firstName: "",
    lastName: "",
    storeName: "",
    storePhone: "",
    storeAddress: "",
    country: "Nigeria",
    state: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [honeypot, setHoneypot] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  // -----------------------------
  // Field handler
  // -----------------------------
  function setField<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "password") setPasswordScore(calcPasswordScore(String(value)));
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
    [formData.email]
  );

  const isPasswordStrong = useMemo(() => {
    const pw = formData.password;
    return pw.length >= PASSWORD_POLICY.minLength && /[A-Z]/.test(pw) && /\d/.test(pw);
  }, [formData.password]);

  // -----------------------------
  // Send verification code
  // -----------------------------
  async function handleSendCode() {
    if (!isEmailValid) return notifyError("Enter a valid email first");

    try {
      const res = await fetch("/api/auth/register/vendor/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sanitize(formData.email),
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          storeName: formData.storeName,
          storePhone: formData.storePhone,
          storeAddress: formData.storeAddress,
          country: formData.country,
          state: formData.state,
        }),
      });

      const data = await res.json();

      if (data.success && data.verificationId) {
        setSentCode(true);
        setVerificationId(data.verificationId);
        notifySuccess("Verification code sent in your email");
      } else notifyError(data.error ?? "Failed to send code");
    } catch {
      notifyError("Unexpected error sending code");
    }
  }

  // -----------------------------
  // Verify code
  // -----------------------------
  async function handleVerifyCode() {
    if (!formData.verificationCode) return notifyError("Verification code required");
    if (!verificationId) return notifyError("Send code first");

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/register/vendor/verify-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: verificationId,
          code: sanitize(formData.verificationCode),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsVerified(true);
        notifySuccess("Code verified, you can continue ");
      } else {
        setIsVerified(false);
        notifyError(data.error ?? "Invalid or expired code");
      }
    } catch {
      notifyError("Unexpected error verifying code");
    } finally {
      setVerifying(false);
    }
  }

  // -----------------------------
  // Submit
  // -----------------------------
 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (honeypot) return;
  if (!isVerified) return notifyError("Verify email first");

  setRegistering(true);
  try {
    const payload = {
      email: sanitize(formData.email),
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      storeName: formData.storeName,
      storePhone: formData.storePhone,
      storeAddress: formData.storeAddress,
      country: formData.country,
      state: formData.state,
      verificationCode: formData.verificationCode,
      agree: formData.agree,
    };

    const res = await fetch("/api/auth/register/vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      notifySuccess("Registration complete");
      setTimeout(() => router.push("/auth/sign-in"), 1500);
    } else {
      notifyError(data.error ?? "Registration failed");
    }
  } catch {
    notifyError("Unexpected error during registration");
  } finally {
    setRegistering(false);
  }
}


  // -----------------------------
  // UI
  // -----------------------------
 return (
  <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 py-10">
    <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold mb-2">
        Vendor Registration
      </h2>

      <h3 className="text-red-700 font-semibold mb-1">
        Important Instructions:
      </h3>

      <ol className="list-decimal pl-5 text-sm sm:text-base text-red-600 mb-6 space-y-1">
        <li>Fill in your email and all required details.</li>
        <li>Click <strong>Send Code</strong>.</li>
        <li>Check your inbox and spam folder.</li>
        <li>Enter the code and click <strong>Verify</strong>.</li>
        <li>Finally, click <strong>Register</strong>.</li>
      </ol>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot */}
        <div className="hidden">
          <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            value={formData.email}
            onChange={(e) => setField("email", e.target.value)}
            className={`w-full p-2.5 text-base border rounded-md focus:outline-none focus:ring ${
              formData.email && !isEmailValid
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-gray-200"
            }`}
          />
        </div>

        {/* Verification */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            placeholder="Verification code"
            value={formData.verificationCode}
            onChange={(e) => setField("verificationCode", e.target.value)}
            className="w-full sm:flex-1 p-2.5 text-base border rounded-md"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendCode}
              className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md"
            >
              Send Code
            </button>

            <button
              type="button"
              onClick={handleVerifyCode}
              className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-md"
            >
              {verifying ? "Verifying..." : "Verify"}
            </button>
          </div>

          <span
            className={`text-sm font-semibold ${
              isVerified ? "text-green-600" : "text-red-500"
            }`}
          >
            {isVerified ? "Verified" : "Not Verified"}
          </span>
        </div>

        {/* Personal & Store Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          />

          <input
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          />

          <input
            placeholder="Store name"
            value={formData.storeName}
            onChange={(e) => setField("storeName", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          />

          <input
            placeholder="Store phone"
            value={formData.storePhone}
            onChange={(e) => setField("storePhone", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          />

          <input
            placeholder="Store address"
            value={formData.storeAddress}
            onChange={(e) => setField("storeAddress", e.target.value)}
            className="p-2.5 text-base border rounded-md sm:col-span-2"
          />

          <select
            value={formData.country}
            onChange={(e) => setField("country", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          >
            <option value="Nigeria">Nigeria</option>
          </select>

          <select
            value={formData.state}
            onChange={(e) => setField("state", e.target.value)}
            className="p-2.5 text-base border rounded-md"
          >
            <option value="">Select State</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setField("password", e.target.value)}
              className="w-full p-2.5 text-base border rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-2 h-2 w-full bg-gray-100 rounded">
            <div
              className={`h-2 rounded ${
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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            className="w-full p-2.5 text-base border rounded-md"
          />
        </div>

        {/* Agree */}
        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.agree}
            onChange={() => setField("agree", !formData.agree)}
            className="mt-1"
          />
          <label>I agree to the terms</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registering || !isVerified}
          className={`w-full py-3 text-base sm:text-lg font-semibold rounded-md text-white transition ${
            registering || !isVerified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900"
          }`}
        >
          {registering ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  </div>
);

}


