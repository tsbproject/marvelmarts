"use client";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { 
  Eye, EyeOff, Mail, Lock, ArrowLeft, 
  Loader2, Facebook, CheckCircle2
} from "lucide-react";
// REDUX IMPORT
import { useDispatch } from "react-redux";
import { setViewMode } from "@/store/appSlice";

function SignInForm() {
  const router = useRouter();
  const dispatch = useDispatch(); // Initialize Redux Dispatch
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Get the callback URL from the query string
    const callbackUrl = searchParams.get("callbackUrl");

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    // MANDATORY SYNC: Fetch the session immediately after successful login
    const session = await getSession();

    if (!session) {
      setError("Authorization failed. Please try again.");
      setLoading(false);
      return;
    }

    /**
     * DUAL ACCOUNT SYNC: 
     * Even if the user is a VENDOR, we default their view to CUSTOMER 
     * in Redux so they land on the marketplace first.
     */
    dispatch(setViewMode("CUSTOMER"));

    // PRIORITY 1: Redirect back to the specific callback path
    if (callbackUrl) {
      window.location.href = callbackUrl;
      return;
    }

    // PRIORITY 2: Role-based dashboard redirect (Fallback)
    const userRole = session?.user?.role?.toUpperCase();

    /**
     * ADJUSTED REDIRECT LOGIC:
     * To ensure dual-account users land as customers first:
     * - Admins go to Admin Dashboard.
     * - Everyone else (Vendor/Customer) goes to Home (/) to browse first.
     */
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      router.push("/dashboard/admins");
    } else {
      // Vendors and Customers land on Home page by default
      router.push("/");
    }
  };


  

  return (
    <div className="w-full max-w-[700px] bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
      
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-gray hover:text-accent-navy transition-all mb-10 text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-black text-neutral-dark tracking-tight mb-3">Sign In</h1>
        <p className="text-neutral-dark font-medium text-lg md:text-xl text-balance">Access your account and manage your orders</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs md:text-xl xl:text-lg 2xl:text-xl font-black text-accent-navy uppercase tracking-[0.15em] ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-neutral-light border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary transition-all outline-none text-sm xl:text-md 2xl:text-lg text-accent-navy font-bold placeholder:text-gray-400 shadow-inner"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs md:text-xl xl:text-lg 2xl:text-xl font-black text-accent-navy uppercase tracking-[0.15em]">Password</label>
            <Link href="/auth/forgot-password"  className="text-xs font-black text-brand-primary hover:underline">
              Reset Password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-2 bg-neutral-light border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary transition-all outline-none text-sm xl:text-md 2xl:text-lg text-neutral-dark font-bold placeholder:text-gray-400 shadow-inner"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2  text-gray-400 hover:text-accent-navy"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-accent-navy text-white rounded-2xl font-black text-xs xl:text-sm 2xl:text-lg hover:bg-accent-navy transition-all active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-[#002B5B]/20 uppercase tracking-widest"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Authorize Access"}
        </button>
      </form>

      {/* Social Access */}
      <div className="relative my-12">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
        <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400 tracking-[0.3em]"><span className="bg-white px-4">Instant Access</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/" })}
          className="flex items-center justify-center gap-3 py-4 border-2 border-neutral-light rounded-2xl hover:border-brand-primary hover:bg-white transition-all font-bold text-neutral-dark"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.64 24.55c0-1.65-.15-3.23-.42-4.75H24v9h12.79c-.55 2.84-2.19 5.25-4.64 6.91l7.46 5.78C44.03 37.32 46.64 31.62 46.64 24.55z"/>
            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.46-5.78c-2.19 1.47-4.99 2.34-8.43 2.34-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Google
        </button>
        <button 
         onClick={() => signIn("facebook", { callbackUrl: searchParams.get("callbackUrl") || "/" })}
          className="flex items-center justify-center gap-3 py-4 border-2 border-neutral-light rounded-2xl hover:border-blue-600 hover:bg-white transition-all font-bold text-accent-navy"
        >
          <Facebook size={20} className="text-blue-600 fill-blue-600" /> Facebook
        </button>
      </div>

      <p className="mt-12 text-center text-neutral-gray font-medium">
        New here?{" "}
        <Link href="/auth/register/customer-registration" className="text-brand-primary font-black hover:underline uppercase tracking-tight">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-neutral-white font-sans">
      
      {/* LEFT SIDE: Brand Identity Sidebar */}
      <div className="hidden lg:flex lg:w-[40%] bg-accent-navy p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="MarvelMarts Logo" 
              width={180} 
              height={50} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-8">
            One MarketPlace. <br />
            <span className="text-brand-primary">Infinite Possibilities.</span>
          </h2>
          
          <ul className="space-y-4">
            {['Premium Marketplace Access', 'Global Vendor Network', 'Priority User Support'].map((text) => (
              <li key={text} className="flex items-center gap-3 text-brand-light font-medium">
                <CheckCircle2 size={20} className="text-brand-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 text-white/50 text-xs font-bold uppercase tracking-widest">
          MarvelMarts International © {new Date().getFullYear()}
        </div>
      </div>

      {/* RIGHT SIDE: Gateway */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 lg:p-24 bg-[#F8F8F8]">
        <Suspense fallback={<div className="animate-pulse text-accent-navy font-black">INITIALIZING GATEWAY...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}