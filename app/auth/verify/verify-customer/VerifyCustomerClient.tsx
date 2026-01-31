// // "use client";

// // import { useState } from "react";
// // import { useSearchParams, useRouter } from "next/navigation";

// // export default function VerifyCustomerClient() {
// //   const searchParams = useSearchParams();
// //   const router = useRouter();

// //   const uid = searchParams.get("uid");

// //   const [code, setCode] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [message, setMessage] = useState("");
// //   const [isSuccess, setIsSuccess] = useState(false);

// //   async function handleVerify() {
// //     if (!uid) {
// //       setMessage("Invalid verification link.");
// //       setIsSuccess(false);
// //       return;
// //     }

// //     if (!code.trim()) {
// //       setMessage("Please enter your verification code.");
// //       setIsSuccess(false);
// //       return;
// //     }

// //     setLoading(true);
// //     setMessage("");

// //     try {
// //       const res = await fetch(`/api/verify-customer`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ uid, code: code.trim() }),
// //       });

// //       const data = await res.json();

// //       if (!res.ok) {
// //         setMessage(data.error || data.details || "Verification failed.");
// //         setIsSuccess(false);
// //       } else {
// //         setMessage("✅ Your account has been verified! Redirecting to login...");
// //         setIsSuccess(true);
// //         setTimeout(() => router.push("/auth/sign-in"), 2000);
// //       }
// //     } catch {
// //       setMessage("Network error. Please try again.");
// //       setIsSuccess(false);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
// //       <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
// //         <h1 className="text-2xl font-bold mb-6 text-center">Customer Verification</h1>

// //         {message && (
// //           <p
// //             className={`mb-4 text-center ${
// //               isSuccess ? "text-green-600 font-semibold" : "text-red-600"
// //             }`}
// //           >
// //             {message}
// //           </p>
// //         )}

// //         <div className="space-y-4">
// //           <label className="block text-left font-medium">Verification Code</label>
// //           <input
// //             type="text"
// //             value={code}
// //             onChange={(e) => setCode(e.target.value)}
// //             placeholder="Enter the code from your email"
// //             className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             disabled={loading}
// //           />

// //           <button
// //             onClick={handleVerify}
// //             disabled={loading || !code.trim()}
// //             className={`w-full p-3 rounded font-semibold transition ${
// //               loading || !code.trim()
// //                 ? "bg-gray-400 cursor-not-allowed"
// //                 : "bg-blue-600 hover:bg-blue-700 text-white"
// //             }`}
// //           >
// //             {loading ? "Verifying..." : "Verify Account"}
// //           </button>
// //         </div>

// //         <p className="text-sm text-gray-500 mt-6 text-center">
// //           Didn’t get the code? Check your spam folder or{" "}
// //           <button
// //             className="underline text-blue-600 hover:text-blue-800"
// //             onClick={() => router.push("/auth/register/customer-registration")}
// //           >
// //             request a new one
// //           </button>.
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { ShieldCheck, Loader2, ArrowRight, MailWarning, CheckCircle2 } from "lucide-react";

// export default function VerifyCustomerClient() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const uid = searchParams.get("uid");

//   const [code, setCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; msg: string }>({
//     type: "idle",
//     msg: "",
//   });

//   // Automatically trigger if code reaches a certain length (optional)
//   useEffect(() => {
//     if (code.length === 6) {
//       handleVerify();
//     }
//   }, [code]);

//   async function handleVerify() {
//     if (!uid) {
//       setStatus({ type: "error", msg: "Invalid or expired verification link." });
//       return;
//     }

//     setLoading(true);
//     setStatus({ type: "idle", msg: "" });

//     try {
//       const res = await fetch(`/api/verify-customer`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ uid, code: code.trim() }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setStatus({ type: "error", msg: data.error || "Invalid verification code." });
//       } else {
//         setStatus({ type: "success", msg: "Account Verified. Redirecting to login..." });
//         setTimeout(() => router.push("/auth/sign-in"), 2500);
//       }
//     } catch {
//       setStatus({ type: "error", msg: "Network error. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfcfc] p-6 text-gray-950">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         {/* Logo / Icon Area */}
//         <div className="flex flex-col items-center mb-10">
//           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 rotate-3">
//              <ShieldCheck className="text-white" size={32} />
//           </div>
//           <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center">
//             Verify <span className="text-blue-600">Account.</span>
//           </h1>
//           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
//             MarvelMarts Secure Access
//           </p>
//         </div>

//         <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          
//           <AnimatePresence mode="wait">
//             {status.msg && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-tight ${
//                   status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
//                 }`}
//               >
//                 {status.type === "success" ? <CheckCircle2 size={16}/> : <MailWarning size={16}/>}
//                 {status.msg}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="space-y-6">
//             <div>
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block text-center">
//                 Enter 6-Digit Code
//               </label>
//               <input
//                 type="text"
//                 maxLength={6}
//                 value={code}
//                 onChange={(e) => setCode(e.target.value.toUpperCase())}
//                 placeholder="------"
//                 className="w-full bg-gray-50 border-none rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-200"
//                 disabled={loading || status.type === "success"}
//               />
//             </div>

//             <button
//               onClick={handleVerify}
//               disabled={loading || code.length < 4 || status.type === "success"}
//               className="w-full group py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 disabled:bg-gray-200 transition-all active:scale-95"
//             >
//               {loading ? (
//                 <Loader2 className="animate-spin" size={18} />
//               ) : (
//                 <>
//                   Confirm Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Footer actions */}
//         <div className="mt-8 flex flex-col items-center gap-4">
//           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
//             Didn't receive a code?
//           </p>
//           <button
//             onClick={() => router.push("/auth/register/customer-registration")}
//             className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-gray-950 transition-colors border-b-2 border-blue-600 pb-1"
//           >
//             Request New Link
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }






"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowRight, MailWarning, CheckCircle2 } from "lucide-react";

export default function VerifyCustomerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; msg: string }>({
    type: "idle",
    msg: "",
  });

  async function handleVerify() {
    if (!uid) {
      setStatus({ type: "error", msg: "Invalid or expired verification link." });
      return;
    }

    setLoading(true);
    setStatus({ type: "idle", msg: "" });

    try {
      const res = await fetch(`/api/verify-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", msg: data.error || "Invalid verification code." });
      } else {
        setStatus({ type: "success", msg: "Account Verified. Redirecting to login..." });
        setTimeout(() => router.push("/auth/sign-in"), 2500);
      }
    } catch {
      setStatus({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8F8F8] p-6 text-[#1E1E1E]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / Icon Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#002B5B] rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/20 mb-6">
             <ShieldCheck className="text-[#F7931E]" size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center text-[#002B5B]">
            Verify <span className="text-[#F7931E]">Account.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4B4B4B] mt-2">
            Secure Customer Access
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#FFE8CC] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-xs font-bold uppercase tracking-tight ${
                  status.type === "success" ? "bg-[#FFE8CC] text-[#F7931E]" : "bg-red-50 text-red-600"
                }`}
              >
                {status.type === "success" ? <CheckCircle2 size={16}/> : <MailWarning size={16}/>}
                {status.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#4B4B4B] mb-3 block text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="000000"
                className="w-full bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E] rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-0 transition-all text-[#002B5B]"
                disabled={loading || status.type === "success"}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length < 4 || status.type === "success"}
              className="w-full group py-5 bg-[#002B5B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#1E1E1E] disabled:bg-gray-200 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Confirm Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#F7931E]" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => router.push("/auth/register/customer-registration")}
            className="text-[11px] font-black uppercase tracking-widest text-[#002B5B] hover:text-[#F7931E] transition-colors border-b-2 border-[#F7931E] pb-1"
          >
            Resend Verification Link
          </button>
        </div>
      </motion.div>
    </div>
  );
}
