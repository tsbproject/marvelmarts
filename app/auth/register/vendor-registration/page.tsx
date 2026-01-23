"use client";

import { useState, useMemo } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Store, 
  User, 
  ShieldCheck, 
  Lock, 
  Smartphone,
  MapPin,
  CheckCircle2
} from "lucide-react";

// ---------------------------------
// Constants
// ---------------------------------
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja",
] as const;

// ------------------------
// Zod schema
// ------------------------
const vendorSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type VendorFormData = z.infer<typeof vendorSchema>;

// -----------------------------
// Component
// -----------------------------
export default function VendorRegistration() {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotification();
  
  // Local State
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VendorFormData>({
    email: "", verificationCode: "", firstName: "", lastName: "",
    storeName: "", storePhone: "", storeAddress: "", country: "Nigeria",
    state: "", password: "", confirmPassword: "", agree: false,
  });

  const [loading, setLoading] = useState({ code: false, verify: false, submit: false });
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Field handler
  function setField<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  // Password Strength Logic
  const passwordScore = useMemo(() => {
    let score = 0;
    const pw = formData.password;
    if (pw.length >= 6) score += 30;
    if (/[A-Z]/.test(pw)) score += 30;
    if (/\d/.test(pw)) score += 40;
    return score;
  }, [formData.password]);

  // API Handlers
  async function handleSendCode() {
    if (!formData.email.includes("@")) return notifyError("Enter a valid email");
    setLoading(prev => ({ ...prev, code: true }));
    try {
      const res = await fetch("/api/auth/register/vendor/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.verificationId) {
        setVerificationId(data.verificationId);
        notifySuccess("Verification code sent to your email");
      } else notifyError(data.error ?? "Failed to send code");
    } finally {
      setLoading(prev => ({ ...prev, code: false }));
    }
  }

  async function handleVerifyCode() {
    if (!formData.verificationCode || !verificationId) return notifyError("Missing details");
    setLoading(prev => ({ ...prev, verify: true }));
    try {
      const res = await fetch("/api/auth/register/vendor/verify-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: verificationId, code: formData.verificationCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        notifySuccess("Email verified successfully");
      } else notifyError(data.error ?? "Invalid code");
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isVerified) return notifyError("Please verify your email first");
    
    setLoading(prev => ({ ...prev, submit: true }));
    try {
      const res = await fetch("/api/auth/register/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess("Registration successful!");
        setTimeout(() => router.push("/auth/sign-in"), 1500);
      } else notifyError(data.error ?? "Registration failed");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }

  return (
    <div className="min-h-screen bg-brand-ghost flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-brand-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Progress Header */}
        <div className="bg-brand-navy p-8 text-brand-white">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => router.back()} className="hover:text-brand-orange transition-colors">
              <ChevronLeft size={28} />
            </button>
            <h2 className="text-3xl font-bold text-accent-navy">Vendor Onboarding</h2>
            <div className="w-8" /> {/* Spacer */}
          </div>
          
          <div className="flex justify-between max-w-md mx-auto relative">
            {[1, 2, 3].map((i) => (
              <div key={i} className="z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                  step >= i ? "bg-brand-orange border-brand-orange" : "bg-brand-navy border-gray-500"
                }`}>
                  {step > i ? <CheckCircle2 size={20} /> : i}
                </div>
                <span className={`text-xs uppercase tracking-wider ${step >= i ? "text-brand-orange" : "text-gray-400"}`}>
                  {i === 1 ? "Account" : i === 2 ? "Store" : "Finalize"}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-700 -z-0" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-brand-orange transition-all duration-500 -z-0" 
              style={{ width: `${(step - 1) * 50}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-12">
          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                    <User size={16} /> First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                    <User size={16} /> Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                  <Mail size={16} /> Business Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={isVerified}
                    className="flex-1 p-3 bg-brand-ghost border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-50"
                  />
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading.code}
                      className="px-6 bg-brand-navy text-brand-white rounded-xl font-bold hover:bg-brand-black transition-colors disabled:opacity-50"
                    >
                      {loading.code ? "..." : "Send Code"}
                    </button>
                  )}
                </div>
              </div>

              {verificationId && !isVerified && (
                <div className="space-y-2 p-4 bg-brand-orange-light rounded-2xl border border-brand-orange/20 animate-in zoom-in-95">
                  <label className="text-sm font-bold text-brand-navy flex items-center gap-2">
                    <ShieldCheck size={16} /> Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 4-digit code"
                      value={formData.verificationCode}
                      onChange={(e) => setField("verificationCode", e.target.value)}
                      className="flex-1 p-3 border border-brand-orange/30 rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={loading.verify}
                      className="px-6 bg-green-600 text-brand-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                      {loading.verify ? "Checking..." : "Verify"}
                    </button>
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-200">
                  <CheckCircle2 size={20} /> Email Verified Successfully
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isVerified}
                className="w-full py-4 bg-brand-orange text-brand-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:grayscale"
              >
                Continue to Store Details <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* STEP 2: STORE INFO */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                  <Store size={16} /> Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marvel Mart Lagos"
                  value={formData.storeName}
                  onChange={(e) => setField("storeName", e.target.value)}
                  className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                    <Smartphone size={16} /> Business Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="080..."
                    value={formData.storePhone}
                    onChange={(e) => setField("storePhone", e.target.value)}
                    className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                    <MapPin size={16} /> State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                   Store Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Full physical address"
                  value={formData.storeAddress}
                  onChange={(e) => setField("storeAddress", e.target.value)}
                  className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-brand-gray text-brand-white rounded-xl font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.storeName || !formData.state}
                  className="flex-[2] py-4 bg-brand-orange text-brand-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  Final Step <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY & FINALIZE */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-gray flex items-center gap-2">
                  <Lock size={16} /> Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brand-gray text-xs font-bold"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      passwordScore < 40 ? "bg-red-500" : passwordScore < 70 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${passwordScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-gray">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  className="w-full p-3 bg-brand-ghost border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <label className="flex items-start gap-3 p-4 bg-brand-ghost rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agree}
                  onChange={() => setField("agree", !formData.agree)}
                  className="mt-1 w-5 h-5 accent-brand-orange"
                />
                <span className="text-sm text-brand-gray">
                  I certify that I am an authorized representative of this business and agree to Marvelmarts' 
                  <span className="text-brand-orange font-bold"> Terms of Service</span> and 
                  <span className="text-brand-orange font-bold"> Privacy Policy</span>.
                </span>
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-brand-gray text-brand-white rounded-xl font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading.submit || !formData.agree}
                  className="flex-[2] py-4 bg-brand-navy text-brand-white rounded-xl font-black text-xl hover:bg-brand-black shadow-lg hover:shadow-brand-navy/30 transition-all disabled:opacity-50"
                >
                  {loading.submit ? "Processing..." : "REGISTER AS VENDOR"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}