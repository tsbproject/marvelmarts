"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useNotification } from "@/app/_context/NotificationContext";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  CheckCircle2,
  Building2,
  LockKeyhole,
  RefreshCcw
} from "lucide-react";

// ---------------------------------
// Constants & Schema
// ---------------------------------
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja",
] as const;

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

export default function VendorRegistration() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const { notifyError, notifySuccess } = useNotification();
  
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isReapplying, setIsReapplying] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    email: "", verificationCode: "", firstName: "", lastName: "",
    storeName: "", storePhone: "", storeAddress: "", country: "Nigeria",
    state: "", password: "", confirmPassword: "", agree: false,
  });

  const [loading, setLoading] = useState({ code: false, verify: false, submit: false, initial: true });
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- PRE-FILL LOGIC ---
  // --- PRE-FILL LOGIC --- 
useEffect(() => {
  async function fetchExistingData() {
    // 1. Pre-fill from existing NextAuth session (but only for email/name, NOT verification)
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || prev.email,
        firstName: session.user.name?.split(" ")[0] || prev.firstName,
        lastName: session.user.name?.split(" ")[1] || prev.lastName,
      }));
      // Do NOT set isVerified here, because session user might just be CUSTOMER
    }

    // 2. Check if the user already has a vendor profile
    try {
      const res = await fetch("/api/vendor/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.vendor) {
          // Only mark as verified if vendor profile exists
          setFormData(prev => ({
            ...prev,
            email: data.vendor.user?.email || prev.email,
            firstName: data.vendor.user?.firstName || prev.firstName,
            lastName: data.vendor.user?.lastName || prev.lastName,
            storeName: data.vendor.storeName || "",
            storePhone: data.vendor.storePhone || "",
            storeAddress: data.vendor.storeAddress || "",
            state: data.vendor.state || "",
          }));
          setIsVerified(true);
          setIsReapplying(true); // User is updating an existing vendor account
          setStep(2);
        }
      } else if (res.status === 404) {
        // No vendor account exists: this is a fresh vendor registration
        setIsVerified(false);
        setIsReapplying(false);
      }
    } catch (err) {
      console.warn("User is not a vendor yet, ready for fresh registration.");
      setIsVerified(false);
      setIsReapplying(false);
    }

    setLoading(prev => ({ ...prev, initial: false }));
  }

  if (status !== "loading") {
    fetchExistingData();
  }
}, [session, status]);

  const setField = useCallback(<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const passwordScore = useMemo(() => {
    let score = 0;
    const pw = formData.password;
    if (pw.length >= 6) score += 30;
    if (/[A-Z]/.test(pw)) score += 30;
    if (/[^A-Za-z0-9]/.test(pw)) score += 40;
    return score;
  }, [formData.password]);

  // API Handlers
  async function handleSendCode() {
    if (!formData.email || !formData.email.includes("@")) {
        return notifyError("Please enter a valid email address.");
    }
    
    setLoading(prev => ({ ...prev, code: true }));

    try {
      const res = await fetch("/api/auth/register/vendor/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName || "Vendor", // Ensure backend receives a string
          lastName: formData.lastName || "Applicant",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationId(data.verificationId);
        notifySuccess("Verification code sent to your email!");
      } else {
        notifyError(data.error || data.message || "Failed to send code");
      }
    } catch (err) {
      notifyError("Connection error. Check your internet.");
    } finally {
      setLoading(prev => ({ ...prev, code: false }));
    }
  }

  async function handleVerifyCode() {
    if (!formData.verificationCode || !verificationId) return notifyError("Enter the code sent to your email.");
    setLoading(prev => ({ ...prev, verify: true }));
    try {
      const res = await fetch("/api/auth/verify/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: verificationId, code: formData.verificationCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        notifySuccess("Email verified successfully");
      } else notifyError(data.error ?? "Invalid or expired code");
    } catch (err) {
      notifyError("Verification failed.");
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  // Use your global Notification helpers
  if (!isVerified) return notifyError("Please verify your email first");
  if (formData.password !== formData.confirmPassword) return notifyError("Passwords do not match");
  
  setLoading(prev => ({ ...prev, submit: true }));

  try {
    const res = await fetch("/api/auth/register/vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        isReapplication: isReapplying,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // 1. Notify the user
      notifySuccess(isReapplying ? "Application resubmitted!" : "Account created! Please sign in to continue.");
      
      // 2. IMPORTANT: Redirect to sign-in, not the dashboard.
      // This ensures the next time they log in, NextAuth fetches the new VENDOR role.
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);

    } else {
      notifyError(data.error || "Registration failed. Check your inputs.");
    }
  } catch (err) {
    notifyError("A network error occurred.");
  } finally {
    setLoading(prev => ({ ...prev, submit: false }));
  }
}
  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-brand-primary" size={48} />
          <p className="font-black text-sm  text-accent-navy animate-pulse">SETTING UP MERCHANT PORTAL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-4">
      <div className="max-w-2xl w-full bg-neutral-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500">
        
        {/* Progress Header */}
        <div className="bg-accent-navy p-10 text-neutral-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <button 
              type="button"
              onClick={() => router.back()} 
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-neutral-white"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="text-center">
              <h2 className="text-sm md:text-2xl font-black tracking-tight uppercase">
                {isReapplying ? "Update Store" : "Merchant Onboarding"}
              </h2>
              <p className="text-[#FFE8CC] font-bold text-xs md:text-sm 2xl:text-xl mt-1 uppercase tracking-tighter">
                {isReapplying ? "Marvelmarts Resubmission" : "Scale your business with Marvelmarts"}
              </p>
            </div>
            <div className="w-10" /> 
          </div>
          
          <div className="flex justify-between max-w-lg  mx-auto relative z-10">
            {[
              { id: 1, label: "Personal", icon: <User size={18} /> },
              { id: 2, label: "Business", icon: <Building2 size={18} /> },
              { id: 3, label: "Security", icon: <LockKeyhole size={18} /> }
            ].map((item) => (
              <div key={item.id} className="flex flex-col  items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center  justify-center font-black transition-all duration-300 shadow-lg ${
                  step >= item.id ? "bg-brand-primary  text-brand-white scale-110" : "bg-brand-white/10 text-brand-white/50 border border-white/20"
                }`}>
                  {step > item.id ? <CheckCircle2 size={24} /> : item.icon}
                </div>
                <span className={`text-[10px] md:text-sm lg:text-md 2xl:text-lg font-black uppercase tracking-widest ${step >= item.id ? "text-brand-primary" : "text-white/40"}`}>
                  {item.label}
                </span>
              </div>
            ))}
            <div className="absolute top-6 left-0 w-full h-1 bg-white/10 -z-10 rounded-full" />
            <div 
              className="absolute top-6 left-0 h-1 bg-brand-primary transition-all duration-700 -z-10 rounded-full shadow-[0_0_10pxbrand-primary" 
              style={{ width: `${(step - 1) * 50}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-14">
          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs 2xl:text-sm font-black uppercase tracking-widest text-accent-navy ml-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter first name  "
                    value={formData.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="w-full p-3 text-xs bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-navy ml-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="w-full p-3 text-xs bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-gray transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs 2xl:text-sm font-black uppercase tracking-widest text-accent-navy ml-1">
                    Business Email
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="vendor@company.com"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={isVerified}
                    className="w-full p-2 text-xs bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-gray transition-all"
                  />
                  {!isVerified && (
                  <button
  type="button"
  onClick={handleSendCode}
  disabled={loading.code}
  className="
    /* Layout & Sizing */
    flex items-center justify-center
    min-w-[120px] sm:min-w-[140px]
    h-[50px] sm:h-[60px]
    px-6 sm:px-8
    
    /* Typography */
    font-black uppercase tracking-widest
    text-[9px] sm:text-[10px]
    
    /* Styling */
    bg-accent-navy text-neutral-white 
    rounded-2xl 
    transition-all duration-200
    
    /* Interaction */
    hover:bg-brand-black 
    active:scale-[0.98]
    disabled:opacity-50 
    disabled:cursor-not-allowed
    disabled:hover:bg-accent-navy
  "
>
  {loading.code ? (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>Sending...</span>
    </div>
  ) : (
    "Send Code"
  )}
</button>
                  )}
                </div>
              </div>

              {verificationId && !isVerified && (
                <div className="space-y-4 p-6 bg-[#FFE8CC] rounded-3xl border border-brand-primary/20 animate-in zoom-in-95 duration-300">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-navy ml-1 flex items-center gap-2">
                    <ShieldCheck size={16} /> Verification Code
                  </label>
                  <div className="flex xxs:flex-col gap-3">
                    <input
                      type="text"
                      placeholder="XXXXXX"
                      value={formData.verificationCode}
                      onChange={(e) => setField("verificationCode", e.target.value)}
                      className="flex-1 p-4 bg-brand-white border-2 border-brand-primary/30 rounded-2xl outline-none font-black text-center tracking-[0.5em] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={loading.verify}
                      className="px-8 bg-green-600 text-brand-white rounded-2xl font-black uppercase tracking-wider hover:bg-green-700 transition-all h-[64px]"
                    >
                      {loading.verify ? "..." : "Verify"}
                    </button>
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="flex items-center gap-3 text-green-700 font-black bg-green-50 p-5 rounded-2xl border-2 border-green-100 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 size={24} className="text-green-600" /> EMAIL VERIFIED
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isVerified}
                className="w-full py-3 bg-brand-primary text-white rounded-3xl font-black text-sm md:text-md lg:text-lg 2xl:text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
              >
                Continue to Store Details <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* STEP 2: STORE INFO */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              {(isReapplying || session?.user) && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                  <RefreshCcw className="text-blue-600" size={18} />
                  <p className="text-[10px] font-black text-blue-700 uppercase italic">
                    {isReapplying ? "Update Mode: Existing Data Loaded." : "Customer Account Detected: Verified."}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                  <Store size={16} className="text-brand-primary" /> Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marvel Mart Lagos"
                  value={formData.storeName}
                  onChange={(e) => setField("storeName", e.target.value)}
                  className="w-full p-4 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                    <Smartphone size={16} className="text-brand-primary" /> Business Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="080 0000 0000"
                    value={formData.storePhone}
                    onChange={(e) => setField("storePhone", e.target.value)}
                    className="w-full p-4 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                    <MapPin size={16} className="text-brand-primary" /> Operating State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className="w-full p-4 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black appearance-none cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1">Physical Store Address</label>
                <textarea
                  rows={3}
                  placeholder="Street address, Suite/Shop number..."
                  value={formData.storeAddress}
                  onChange={(e) => setField("storeAddress", e.target.value)}
                  className="w-full p-4 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-[#4B4B4B] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-black transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.storeName || !formData.state}
                  className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Final Step <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY & FINALIZE */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1 flex items-center gap-2">
                  <Lock size={16} className="text-brand-primary" /> {isReapplying || session?.user ? "Verify Security Password" : "Create Store Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className="w-full p-5 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4B4B4B] text-xs font-black uppercase"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="px-1 space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        passwordScore < 40 ? "bg-red-500" : passwordScore < 70 ? "bg-brand-primary" : "bg-green-500"
                      }`}
                      style={{ width: `${passwordScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[#4B4B4B] ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  className="w-full p-5 bg-neutral-white border-2 border-transparent focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none font-bold text-brand-black"
                  placeholder="••••••••"
                />
              </div>

              <div className="p-6 bg-neutral-white border-2 border-dashed border-gray-200 rounded-[2rem]">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={formData.agree}
                      onChange={() => setField("agree", !formData.agree)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-[#4B4B4B] checked:border-brand-primary checked:bg-brand-primary transition-all"
                    />
                    <CheckCircle2 size={16} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-[#4B4B4B] leading-relaxed group-hover:text-brand-black">
                    I certify that I am authorized to register this business. I agree to the 
                    <span className="text-brand-primary underline mx-1">Terms</span> and 
                    <Link href="/privacy-policy"><span className="text-brand-primary underline mx-1"> Privacy Policy</span>.</Link>
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-5 bg-[#4B4B4B] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-black"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading.submit || !formData.agree}
                  className="flex-[2] py-6 bg-accent-navy text-white rounded-3xl font-black text-xl shadow-2xl shadow-accent-navy/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading.submit ? "PROCESSING..." : isReapplying ? "RESUBMIT" : "LAUNCH MY STORE"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}