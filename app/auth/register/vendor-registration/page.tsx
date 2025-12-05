// "use client";

// import { useState, useMemo } from "react";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { z } from "zod";

// // Validation schema
// const vendorSchema = z.object({
//   email: z.string().email("Invalid email"),
//   verificationCode: z.string().min(4, "Enter verification code"),
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   storeName: z.string().min(1, "Store name is required"),
//   storePhone: z.string().min(10, "Enter valid phone"),
//   storeAddress: z.string().min(5, "Store address required"),
//   country: z.string().min(1),
//   state: z.string().min(1, "State required"),
//   password: z.string().min(6, "Password must be at least 6 chars"),
//   confirmPassword: z.string().min(6),
//   agree: z.literal(true, { errorMap: () => ({ message: "You must agree to terms" }) }),
// }).refine(data => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

// type VendorFormData = z.infer<typeof vendorSchema>;

// const PASSWORD_POLICY = { minLength: 6, requireUpper: true, requireNumber: true };
// function calcPasswordScore(pw: string) {
//   let score = 0;
//   if (pw.length >= PASSWORD_POLICY.minLength) score += 30;
//   if (/[A-Z]/.test(pw)) score += 30;
//   if (/\d/.test(pw)) score += 30;
//   if (/[^A-Za-z0-9]/.test(pw)) score += 10;
//   return Math.min(100, score);
// }
// function sanitize(input: string) { return input.replace(/[<>]/g, "").trim(); }

// export default function VendorRegistration() {
//   const { notifySuccess, notifyError } = useNotification();

//   const [formData, setFormData] = useState<VendorFormData>({
//     email: "",
//     verificationCode: "",
//     firstName: "",
//     lastName: "",
//     storeName: "",
//     storePhone: "",
//     storeAddress: "",
//     country: "Nigeria",
//     state: "",
//     password: "",
//     confirmPassword: "",
//     agree: false,
//   });

//   const [honeypot, setHoneypot] = useState("");
//   const [sentCode, setSentCode] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [registering, setRegistering] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [passwordScore, setPasswordScore] = useState(0);

//   function setField<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) {
//     setFormData(prev => ({ ...prev, [key]: value }));
//     if (key === "password") setPasswordScore(calcPasswordScore(String(value)));
//   }

//   const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()), [formData.email]);
//   const isPasswordStrong = useMemo(() => {
//     const pw = formData.password;
//     return pw.length >= PASSWORD_POLICY.minLength && /[A-Z]/.test(pw) && /\d/.test(pw);
//   }, [formData.password]);

//   async function handleResendCode() {
//     if (!isEmailValid) return notifyError("Enter valid email");

//     try {
//       const res = await fetch("/api/auth/register/vendor/send-code", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: sanitize(formData.email) }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setSentCode(true);
//         notifySuccess(data.code ? `(dev) Code: ${data.code}` : "Verification code sent");
//       } else notifyError(data.error ?? "Failed to send code");
//     } catch (err: unknown) {
//       notifyError((err as Error)?.message ?? "Unexpected error");
//     }
//   }

//   async function handleVerifyCode() {
//     if (!formData.email || !formData.verificationCode) return notifyError("Email and code required");

//     setVerifying(true);
//     try {
//       const res = await fetch("/api/auth/register/vendor/verify-code", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: sanitize(formData.email), code: sanitize(formData.verificationCode) }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         notifySuccess("Code verified — you can continue");
//         setIsVerified(true);
//       } else {
//         notifyError(data.error ?? "Invalid or expired code");
//         setIsVerified(false);
//       }
//     } catch (err: unknown) {
//       notifyError((err as Error)?.message ?? "Unexpected error");
//       setIsVerified(false);
//     } finally {
//       setVerifying(false);
//     }
//   }

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     if (honeypot) return;

//     const validation = vendorSchema.safeParse(formData);
//     if (!validation.success) return notifyError(validation.error.errors[0]?.message ?? "Validation failed");
//     if (!isEmailValid) return notifyError("Invalid email");
//     if (!isPasswordStrong) return notifyError(`Password must meet policy`);
//     if (!isVerified) return notifyError("You must verify your email first");

//     setRegistering(true);
//     try {
//       const res = await fetch("/api/auth/register/vendor", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, email: sanitize(formData.email) }),
//       });
//       const data = await res.json();
//       if (data.success) notifySuccess("Registration complete — please sign in");
//       else notifyError(data.error ?? "Registration failed");
//     } catch (err: unknown) {
//       notifyError((err as Error)?.message ?? "Unexpected error");
//     } finally {
//       setRegistering(false);
//     }
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
//       <div className="w-full max-w-3xl bg-white p-8 rounded shadow">
//         <h2 className="text-2xl font-bold mb-6">Vendor Registration</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div style={{ display: "none" }}>
//             <input value={honeypot} onChange={e => setHoneypot(e.target.value)} />
//           </div>
//           <div>
//             <label>Email *</label>
//             <input
//               value={formData.email}
//               onChange={e => setField("email", e.target.value)}
//               className={`w-full p-2 border rounded ${formData.email && !isEmailValid ? "border-red-400" : ""}`}
//             />
//             {formData.email && !isEmailValid && <p className="text-red-500 text-xs mt-1">Invalid email</p>}
//           </div>

//           <div className="flex gap-4 items-center">
//             <input placeholder="Verification code" value={formData.verificationCode} onChange={e => setField("verificationCode", e.target.value)} className="flex-1 p-2 border rounded" />
//             <button type="button" onClick={handleResendCode} className="px-4 py-2 bg-blue-600 text-white rounded">Send Code</button>
//             <button type="button" onClick={handleVerifyCode} className="px-4 py-2 bg-green-600 text-white rounded">{verifying ? "Verifying..." : "Verify Code"}</button>
//             <span className={`ml-2 font-semibold ${isVerified ? "text-green-600" : "text-red-500"}`}>{isVerified ? "Verified" : "Not verified"}</span>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <input placeholder="First name" value={formData.firstName} onChange={e => setField("firstName", e.target.value)} className="p-2 border rounded" />
//             <input placeholder="Last name" value={formData.lastName} onChange={e => setField("lastName", e.target.value)} className="p-2 border rounded" />
//             <input placeholder="Store name" value={formData.storeName} onChange={e => setField("storeName", e.target.value)} className="p-2 border rounded" />
//             <input placeholder="Store phone" value={formData.storePhone} onChange={e => setField("storePhone", e.target.value)} className="p-2 border rounded" />
//             <input placeholder="Store address" value={formData.storeAddress} onChange={e => setField("storeAddress", e.target.value)} className="p-2 border rounded" />
//             <input placeholder="State" value={formData.state} onChange={e => setField("state", e.target.value)} className="p-2 border rounded" />
//           </div>

//           <div>
//             <label>Password *</label>
//             <div className="relative mt-1">
//               <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setField("password", e.target.value)} className="w-full p-2 border rounded" />
//               <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm" onClick={() => setShowPassword(!showPassword)}>
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//             <div className="mt-2 h-2 w-full bg-gray-100 rounded">
//               <div className={`h-2 rounded ${passwordScore < 40 ? "bg-red-500" : passwordScore < 70 ? "bg-yellow-400" : "bg-green-500"}`} style={{ width: `${passwordScore}%` }} />
//             </div>
//           </div>

//           <div>
//             <label>Confirm Password *</label>
//             <input type="password" value={formData.confirmPassword} onChange={e => setField("confirmPassword", e.target.value)} className="w-full p-2 border rounded" />
//           </div>

//           <div className="flex items-center gap-2">
//             <input type="checkbox" checked={formData.agree} onChange={() => setField("agree", !formData.agree)} />
//             <label>I agree to the terms</label>
//           </div>

//           <button disabled={registering || !isVerified} type="submit" className={`w-full py-2 rounded text-white ${registering || !isVerified ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}>
//             {registering ? "Registering..." : "Register"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useMemo } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { z } from "zod";

// ------------------------
// Zod schema for validation
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
    country: z.string().min(1),
    state: z.string().min(1, "State required"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    confirmPassword: z.string().min(6),
    agree: z.literal(true, {
      errorMap: () => ({ message: "You must agree to terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type VendorFormData = z.infer<typeof vendorSchema>;

// ------------------------
// Password utils
// ------------------------
const PASSWORD_POLICY = { minLength: 6, requireUpper: true, requireNumber: true };

function calcPasswordScore(pw: string) {
  let score = 0;
  if (pw.length >= PASSWORD_POLICY.minLength) score += 30;
  if (/[A-Z]/.test(pw)) score += 30;
  if (/\d/.test(pw)) score += 30;
  if (/[^A-Za-z0-9]/.test(pw)) score += 10;
  return Math.min(100, score);
}

function sanitize(input: string) {
  return input.replace(/[<>]/g, "").trim();
}

// ------------------------
// Component
// ------------------------
export default function VendorRegistration() {
  const { notifySuccess, notifyError } = useNotification();

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

  // ------------------------
  // Field handler
  // ------------------------
  function setField<K extends keyof VendorFormData>(key: K, value: VendorFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "password") setPasswordScore(calcPasswordScore(String(value)));
  }

  // ------------------------
  // Validation helpers
  // ------------------------
  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
    [formData.email]
  );

  const isPasswordStrong = useMemo(() => {
    const pw = formData.password;
    return (
      pw.length >= PASSWORD_POLICY.minLength &&
      /[A-Z]/.test(pw) &&
      /\d/.test(pw)
    );
  }, [formData.password]);

  // ------------------------
  // Send verification code
  // ------------------------
  async function handleSendCode() {
    if (!isEmailValid) {
      notifyError("Enter a valid email first");
      return;
    }

    try {
      const res = await fetch("/api/auth/register/vendor/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitize(formData.email) }),
      });

      const data: { success: boolean; code?: string; error?: string } = await res.json();

      if (data.success) {
        setSentCode(true);
        notifySuccess(data.code ? `(dev) Code: ${data.code}` : "Verification code sent");
      } else {
        notifyError(data.error ?? "Failed to send code");
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Unexpected error");
    }
  }

  // ------------------------
  // Verify code
  // ------------------------
  async function handleVerifyCode() {
    if (!formData.email || !formData.verificationCode) {
      notifyError("Email and verification code required");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/register/vendor/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitize(formData.email), code: sanitize(formData.verificationCode) }),
      });

      const data: { success: boolean; error?: string } = await res.json();

      if (data.success) {
        notifySuccess("Code verified — you can continue");
        setIsVerified(true);
      } else {
        notifyError(data.error ?? "Invalid or expired code");
        setIsVerified(false);
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Unexpected error");
      setIsVerified(false);
    } finally {
      setVerifying(false);
    }
  }

  // ------------------------
  // Submit registration
  // ------------------------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot) return; // bot detected

    const validation = vendorSchema.safeParse(formData);
    if (!validation.success) {
      notifyError(validation.error.errors[0]?.message ?? "Validation failed");
      return;
    }

    if (!isEmailValid) return notifyError("Invalid email");
    if (!isPasswordStrong)
      return notifyError(
        `Password must be at least ${PASSWORD_POLICY.minLength} characters, include 1 uppercase & 1 number.`
      );
    if (!isVerified) return notifyError("You must verify your email first");

    setRegistering(true);
    try {
      const res = await fetch("/api/auth/register/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, email: sanitize(formData.email) }),
      });

      const data: { success: boolean; error?: string } = await res.json();

      if (data.success) {
        notifySuccess("Registration complete — please sign in");
        // Optionally redirect to sign-in page here
      } else {
        notifyError(data.error ?? "Registration failed");
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setRegistering(false);
    }
  }

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Vendor Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot */}
          <div style={{ display: "none" }}>
            <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          {/* Email */}
          <div>
            <label>Email *</label>
            <input
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              className={`w-full p-2 border rounded ${formData.email && !isEmailValid ? "border-red-400" : ""}`}
            />
            {formData.email && !isEmailValid && <p className="text-red-500 text-xs mt-1">Invalid email</p>}
          </div>

          {/* Verification */}
          <div className="flex gap-4 items-center">
            <input
              placeholder="Verification code"
              value={formData.verificationCode}
              onChange={(e) => setField("verificationCode", e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button type="button" onClick={handleSendCode} className="px-4 py-2 bg-blue-600 text-white rounded">
              Send Code
            </button>
            <button type="button" onClick={handleVerifyCode} className="px-4 py-2 bg-green-600 text-white rounded">
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
            <span className={`ml-2 font-semibold ${isVerified ? "text-green-600" : "text-red-500"}`}>
              {isVerified ? "Verified" : "Not verified"}
            </span>
          </div>

          {/* Name & Store */}
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="First name" value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} className="p-2 border rounded" />
            <input placeholder="Last name" value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} className="p-2 border rounded" />
            <input placeholder="Store name" value={formData.storeName} onChange={(e) => setField("storeName", e.target.value)} className="p-2 border rounded" />
            <input placeholder="Store phone" value={formData.storePhone} onChange={(e) => setField("storePhone", e.target.value)} className="p-2 border rounded" />
            <input placeholder="Store address" value={formData.storeAddress} onChange={(e) => setField("storeAddress", e.target.value)} className="p-2 border rounded" />
            <input placeholder="State" value={formData.state} onChange={(e) => setField("state", e.target.value)} className="p-2 border rounded" />
          </div>

          {/* Password */}
          <div>
            <label>Password *</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-100 rounded">
              <div
                className={`h-2 rounded ${passwordScore < 40 ? "bg-red-500" : passwordScore < 70 ? "bg-yellow-400" : "bg-green-500"}`}
                style={{ width: `${passwordScore}%` }}
              />
            </div>
          </div>

          <div>
            <label>Confirm Password *</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} className="w-full p-2 border rounded" />
          </div>

          {/* Agree */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.agree} onChange={() => setField("agree", !formData.agree)} />
            <label>I agree to the terms</label>
          </div>

          {/* Submit */}
          <button
            disabled={registering || !isVerified}
            type="submit"
            className={`w-full py-2 rounded text-white ${registering || !isVerified ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}
          >
            {registering ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

