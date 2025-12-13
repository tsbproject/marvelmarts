// "use client";

// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function VerifyCustomerPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const uid = searchParams.get("uid");

//   const [code, setCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);

//   async function handleVerify() {
//     if (!uid) {
//       setMessage("Invalid verification link.");
//       setIsSuccess(false);
//       return;
//     }

//     if (!code.trim()) {
//       setMessage("Please enter your verification code.");
//       setIsSuccess(false);
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch(`/api/verify-customer`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           uid,              // include uid here
//           code: code.trim() // include code here
//         }),
//       });



//       const data = await res.json();

//       if (!res.ok) {
//         setMessage(data.error || data.details || "Verification failed.");
//         setIsSuccess(false);
//       } else {
//         setMessage("✅ Your account has been verified and created! Redirecting to login...");
//         setIsSuccess(true);
//         setTimeout(() => router.push("/auth/sign-in"), 2000);
//       }
//     } catch {
//       setMessage("Network error. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
//         <h1 className="text-2xl font-bold mb-6 text-center">Customer Verification</h1>

//         {message && (
//           <p
//             className={`mb-4 text-center ${
//               isSuccess ? "text-green-600 font-semibold" : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         <div className="space-y-4">
//           <label className="block text-left font-medium">Verification Code</label>
//           <input
//             type="text"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             placeholder="Enter the code from your email"
//             className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={loading}
//           />

//           <button
//             onClick={handleVerify}
//             disabled={loading || !code.trim()}
//             className={`w-full p-3 rounded font-semibold transition ${
//               loading || !code.trim()
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//           >
//             {loading ? "Verifying..." : "Verify Account"}
//           </button>
//         </div>

//         <p className="text-sm text-gray-500 mt-6 text-center">
//           Didn’t get the code? Check your spam folder or{" "}
//           <button
//             className="underline text-blue-600 hover:text-blue-800"
//             onClick={() => router.push("/auth/register/customer-registration")}
//           >
//             request a new one
//           </button>.
//         </p>
//       </div>
//     </div>
//   );
// }


import { Suspense } from "react";
import VerifyCustomerClient from "./VerifyCustomerClient";

export default function VerifyCustomerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <VerifyCustomerClient />
    </Suspense>
  );
}
