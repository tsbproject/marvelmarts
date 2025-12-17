// // app/auth/sign-in/page.tsx
// "use client";

// import { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import { signIn, getSession } from "next-auth/react";
// import Link from "next/link";

// export default function SignInPage() {
//   const router = useRouter();
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const sanitizedId = sanitize(identifier);
//     if (!sanitizedId || !password) {
//       setError("Email/Username and password are required");
//       setLoading(false);
//       return;
//     }

//     // ✅ Use NextAuth signIn
//     const res = await signIn("credentials", {
//       redirect: false,
//       identifier: sanitizedId,
//       password,
//     });

//     if (res?.error) {
//       setError("Invalid credentials");
//       setLoading(false);
//       return;
//     }

//     // ✅ Get hydrated session with role
//     const session = await getSession();
//     const userRole = session?.user?.role;

//     if (!userRole) {
//       setError("Unable to determine role");
//       setLoading(false);
//       return;
//     }

//     switch (userRole.toUpperCase()) {
//       case "SUPER_ADMIN":
//       case "ADMIN":
//         router.push("/dashboard/admins");
//         break;
//       case "VENDOR":
//         router.push("/account/vendor");
//         break;
//       case "CUSTOMER":
//         router.push("/account/customer");
//         break;
//       default:
//         setError("Unknown role");
//         break;
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="max-w-xl w-full bg-white p-8 rounded-xl border border-brand-dark shadow-lg">
//         <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

//         {error && (
//           <p className="mb-4 text-center text-red-600 bg-red-50 py-2 rounded">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1 text-2xl font-medium">
//               Email or Username
//             </label>
//             <input
//               type="text"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               className="w-full text-xl p-3 border rounded"
//               placeholder="Enter your email or username"
//               required
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-2xl font-medium">Password</label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full text-xl p-3 border rounded pr-12"
//                 placeholder="••••••••"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((p) => !p)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
//                 tabIndex={-1}
//               >
//                 {showPassword ? (
//                   // 👁 Show password icon
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                     />
//                   </svg>
//                 ) : (
//                   // 🚫 Hide password icon
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.03-3.278 3.44-5.827 6.458-6.708M9.88 9.88a3 3 0 104.243 4.243"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 3l18 18"
//                     />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             <Link
//               href="/auth/forgot-password"
//               className="text-blue-600 mt-1 text-xl inline-block"
//             >
//               Forgot Password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 text-2xl bg-accent-navy text-white rounded font-semibold hover:bg-gray-900 ${
//               loading ? "opacity-70 cursor-not-allowed flex items-center justify-center" : ""
//             }`}
//           >
//             {loading ? (
//               <>
//                 <svg
//                   className="animate-spin h-6 w-6 mr-2 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
//                   ></path>
//                 </svg>
//                 Signing in...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>

//         <p className="mt-6 text-center">
//           Don’t have an account?{" "}
//           <Link
//             href="/auth/register/customer-registration"
//             className="text-blue-600 text-xl font-semibold"
//           >
//             Create Account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { FaFacebook, FaGoogle } from "react-icons/fa"; // ✅ social icons

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sanitize = (value: string) => value.replace(/[<>]/g, "").trim();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sanitizedId = sanitize(identifier);
    if (!sanitizedId || !password) {
      setError("Email/Username and password are required");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      identifier: sanitizedId,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const userRole = session?.user?.role;

    if (!userRole) {
      setError("Unable to determine role");
      setLoading(false);
      return;
    }

    switch (userRole.toUpperCase()) {
      case "SUPER_ADMIN":
      case "ADMIN":
        router.push("/dashboard/admins");
        break;
      case "VENDOR":
        router.push("/account/vendor");
        break;
      case "CUSTOMER":
        router.push("/account/customer");
        break;
      default:
        setError("Unknown role");
        break;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl border border-brand-dark shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <p className="mb-4 text-center text-red-600 bg-red-50 py-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username */}
          <div>
            <label className="block mb-1 text-2xl font-medium">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full text-xl p-3 border rounded"
              placeholder="Enter your email or username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-2xl font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl p-3 border rounded pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-blue-600 mt-1 text-xl inline-block"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-2xl bg-accent-navy text-white rounded font-semibold hover:bg-gray-900 ${
              loading ? "opacity-70 cursor-not-allowed flex items-center justify-center" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="grow border-gray-300" />
          <span className="px-4 text-gray-500 text-lg">Or sign in with</span>
          <hr className="grow border-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-3 w-full py-3 border rounded-lg text-xl font-semibold hover:bg-gray-50 transition"
          >
            {/* ✅ Google SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-6 h-6"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C36.2 2.5 30.5 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.9 6.1C12.1 13.1 17.6 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.4 5.5-5.1 7.2l7.9 6.1c4.6-4.2 7.3-10.4 7.3-17.8z"
              />
              <path
                fill="#FBBC05"
                d="M10.4 28.7c-1.2-3.5-1.2-7.3 0-10.8l-7.9-6.1C.9 15.1 0 19.4 0 24s.9 8.9 2.5 12.2l7.9-6.1z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.5 0 12-2.1 16-5.7l-7.9-6.1c-2.2 1.5-5 2.4-8.1 2.4-6.4 0-11.9-4.3-13.9-10.2l-7.9 6.1C6.4 42.6 14.6 48 24 48z"
              />
            </svg>
            Sign in with Google
          </button>

          <button
            onClick={() => signIn("facebook")}
            className="flex items-center justify-center gap-3 w-full py-3 border rounded-lg text-xl font-semibold hover:bg-gray-50 transition"
          >
            {/* ✅ Facebook SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-blue-600"
            >
              <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
            </svg>
            Sign in with Facebook
          </button>
        </div>


        {/* Register link */}
        <p className="mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            href="/auth/register/customer-registration"
            className="text-blue-600 text-xl font-semibold"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

