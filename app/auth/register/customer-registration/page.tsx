


// "use client";

// import { useState, useMemo, FormEvent } from "react";
// import { useRouter } from "next/navigation";

// // ---------------------------------
// // Configuration & Utilities
// // ---------------------------------
// const PASSWORD_POLICY = {
//   minLength: 8,
//   requireUpper: true,
//   requireNumber: true,
//   requireSpecial: true,
// };

// function sanitize(input: string) {
//   return input.replace(/[<>'";]/g, "").trim();
// }

// function validateEmail(input: string) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
// }

// export default function CustomerRegistrationPage() {
//   const router = useRouter();

//   // Form State
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);

//   // Status State
//   const [loading, setLoading] = useState(false);
//   const [honeypot, setHoneypot] = useState("");
//   const [message, setMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);

//   const isPasswordStrong = useMemo(() => {
//     return (
//       password.length >= PASSWORD_POLICY.minLength &&
//       /[A-Z]/.test(password) &&
//       /\d/.test(password) &&
//       /[^A-Za-z0-9]/.test(password)
//     );
//   }, [password]);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setMessage("");
//     setIsSuccess(false);

//     if (honeypot) return; // Bot detected

//     if (!name.trim()) {
//       setMessage("Please enter your full name.");
//       return;
//     }

//     if (!validateEmail(email)) {
//       setMessage("Enter a valid email address.");
//       return;
//     }

//     if (!isPasswordStrong) {
//       setMessage(
//         `Password must be at least ${PASSWORD_POLICY.minLength} characters, include 1 uppercase, 1 number, and 1 special character.`
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/register/customer/send-code", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Form-Security": "secure-customer-registration-v2",
//         },
//         body: JSON.stringify({
//           name: sanitize(name),
//           email: sanitize(email),
//           password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setMessage(data.error || data.details || "Registration failed.");
//         setIsSuccess(false);
//         setLoading(false);
//         return;
//       }

//       setMessage("Verification email sent! Please check your inbox to continue.");
//       setIsSuccess(true);

//       setTimeout(() => {
//         router.push(`/auth/verify/verify-customer?uid=${data.verificationId}`);
//       }, 1500);
//     } catch {
//       setMessage("Network error. Please try again.");
//       setIsSuccess(false);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-brand-ghost p-6">
//       <div className="relative w-full px-6 md:px-15 md:min-h-[600px] max-w-2xl md:max-w-4xl bg-brand-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
        
//         {/* Back arrow at top-left */}
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="absolute top-8 left-8 flex items-center text-brand-gray hover:text-brand-black transition-colors"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//             <path stroke="none" d="M0 0h24v24H0z"/>
//             <path d="M5 12l14 0" />
//             <path d="M5 12l6 6" />
//             <path d="M5 12l6 -6" />
//           </svg>
//           <span className="sr-only">Go back</span>
//         </button>

//         <div className="text-center pt-10">
//           <h1 className="text-3xl md:text-5xl font-black mb-4 text-brand-black tracking-tight">
//             Create Customer Account
//           </h1>
//           <p className="text-xl md:text-2xl font-bold text-brand-primary">
//             Let’s help make this a pleasant experience
//           </p>
//         </div>

//         {/* Honeypot */}
//         <div style={{ display: "none" }}>
//           <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
//         </div>

//         {/* Status Messaging */}
//         {message && (
//           <div className={`mt-8 p-4 rounded-2xl text-center text-lg font-bold border-2 ${
//             isSuccess 
//               ? "bg-green-50 border-green-200 text-green-700" 
//               : "bg-red-50 border-red-200 text-red-600"
//           }`}>
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-8 mt-10">
//           {/* Full Name Field */}
//           <div className="space-y-3">
//             <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Full Name</label>
//             <input
//               required
//               className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="e.g. Tony Stark"
//             />
//           </div>

//           {/* Email Field */}
//           <div className="space-y-3">
//             <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Email Address</label>
//             <input
//               required
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
//               placeholder="example@gmail.com"
//             />
//           </div>

//           {/* Password Field */}
//           <div className="space-y-3">
//             <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Secure Password</label>
//             <div className="relative">
//               <input
//                 required
//                 type={passwordVisible ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setPasswordVisible(!passwordVisible)}
//                 className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-brand-gray hover:text-brand-primary"
//               >
//                 {passwordVisible ? "HIDE" : "SHOW"}
//               </button>
//             </div>
//             <p className="text-sm font-bold text-brand-gray/60 mt-2 ml-1">
//               Policy: {PASSWORD_POLICY.minLength}+ chars, 1 uppercase, 1 number, 1 special character
//             </p>
//           </div>

//           {/* Submit Button */}
//           <button
//             disabled={loading}
//             className={`w-full py-5 md:py-8 text-xl md:text-3xl bg-accent-navy text-white rounded-[1.5rem] font-black tracking-tight shadow-xl hover:shadow-accent-navy/30 transition-all active:scale-[0.98] ${
//               loading ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-black"
//             }`}
//           >
//             {loading ? "Creating Account..." : "Register Now"}
//           </button>
//         </form>

//         {/* Footer Links */}
//         <div className="mt-10 space-y-4 text-center">
//           <p className="text-lg md:text-xl font-bold text-brand-gray">
//             Already have an account?{" "}
//             <a href="/auth/sign-in" className="text-brand-primary hover:underline underline-offset-4">
//               Sign in
//             </a>
//           </p>

//           <div className="pt-6 border-t border-gray-100">
//             <p className="text-lg md:text-2xl font-bold text-brand-black">
//               Are you a merchant?{" "}
//               <a href="/auth/register/vendor-registration" className="text-accent-navy hover:text-brand-primary underline transition-colors">
//                 Register as Vendor
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext"; 

// ---------------------------------
// Configuration & Utilities
// ---------------------------------
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
  const { notifyError, notifySuccess } = useNotification(); 
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Status State
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
      const err = "Please enter your full name.";
      notifyError(err);
      setMessage(err);
      return;
    }

    if (!validateEmail(email)) {
      const err = "Enter a valid email address.";
      notifyError(err);
      setMessage(err);
      return;
    }

    if (!isPasswordStrong) {
      const err = `Password must be at least ${PASSWORD_POLICY.minLength} characters, include 1 uppercase, 1 number, and 1 special character.`;
      notifyError(err);
      setMessage(err);
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
        const errorMsg = data.error || data.details || "Registration failed.";
        notifyError(errorMsg);
        setMessage(errorMsg);
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      const successMsg = "Verification email sent! Please check your inbox to continue.";
      notifySuccess(successMsg);
      setMessage(successMsg);
      setIsSuccess(true);

      setTimeout(() => {
        router.push(`/auth/verify/verify-customer?uid=${data.verificationId}`);
      }, 1500);
    } catch {
      const err = "Network error. Please try again.";
      notifyError(err);
      setMessage(err);
      setIsSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-ghost p-6">
      <div className="relative w-full px-6 md:px-15 md:min-h-[600px] max-w-2xl md:max-w-4xl bg-brand-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
        
        {/* Back arrow at top-left */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-8 left-8 flex items-center text-brand-gray hover:text-brand-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z"/>
            <path d="M5 12l14 0" />
            <path d="M5 12l6 6" />
            <path d="M5 12l6 -6" />
          </svg>
          <span className="sr-only">Go back</span>
        </button>

        <div className="text-center pt-10">
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-brand-black tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xl md:text-2xl font-bold text-brand-primary">
            Let’s help make this a pleasant experience
          </p>
        </div>

        {/* Honeypot */}
        <div style={{ display: "none" }}>
          <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {/* Status Messaging */}
        {message && (
          <div className={`mt-8 p-4 rounded-2xl text-center text-lg font-bold border-2 ${
            isSuccess 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 mt-10">
          {/* Full Name Field */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Full Name</label>
            <input
              required
              className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tony Stark"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
              placeholder="example@gmail.com"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-brand-gray ml-1">Secure Password</label>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 md:p-6 text-lg md:text-2xl bg-brand-ghost border-2 border-transparent focus:border-brand-primary/20 focus:bg-brand-white rounded-2xl outline-none font-bold text-brand-black transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-brand-gray hover:text-brand-primary"
              >
                {passwordVisible ? "HIDE" : "SHOW"}
              </button>
            </div>
            <p className="text-sm font-bold text-brand-gray/60 mt-2 ml-1">
              Policy: {PASSWORD_POLICY.minLength}+ chars, 1 uppercase, 1 number, 1 special character
            </p>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className={`w-full py-5 md:py-8 text-xl md:text-3xl bg-accent-navy text-white rounded-[1.5rem] font-black tracking-tight shadow-xl hover:shadow-accent-navy/30 transition-all active:scale-[0.98] ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-black"
            }`}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-10 space-y-4 text-center">
          <p className="text-lg md:text-xl font-bold text-brand-gray">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="text-brand-primary hover:underline underline-offset-4">
              Sign in
            </a>
          </p>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-lg md:text-2xl font-bold text-brand-black">
              Are you a merchant?{" "}
              <a href="/auth/register/vendor-registration" className="text-accent-navy hover:text-brand-primary underline transition-colors">
                Register as Vendor
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}