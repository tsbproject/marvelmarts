// // "use client";

// // import { signOut, useSession } from "next-auth/react";
// // import { useRouter } from "next/navigation";
// // import { useState } from "react";

// // type SignOutButtonProps = {
// //   redirectPath?: string; // optional path to redirect after sign-out
// //   label?: string; // button text
// //   className?: string; // optional styling
// // };

// // export default function SignOutButton({
// //   redirectPath = "/auth/sign-in",
// //   label = "Sign Out",
// //   className = "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50",
// // }: SignOutButtonProps) {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   const [loading, setLoading] = useState(false);

// //   const handleSignOut = async () => {
// //     if (status === "loading") return;

// //     setLoading(true);
// //     try {
// //       // Remove JWT cookie & end session
// //       await signOut({ redirect: false });

// //       // Redirect to the provided path
// //       router.push(redirectPath);
// //     } catch (error) {
// //       console.error("Sign-out error:", error);
// //       setLoading(false);
// //     }
// //   };

// //   if (!session?.user) return null;

// //   return (
// //     <button onClick={handleSignOut} disabled={loading} className={className}>
// //       {loading ? "Signing out..." : label}
// //     </button>
// //   );
// // }





// "use client";

// import { signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useDispatch } from "react-redux";

// type SignOutButtonProps = {
//   redirectPath?: string; // optional path to redirect after sign-out
//   label?: string; // button text
//   className?: string; // optional styling
// };

// export default function SignOutButton({
//   redirectPath = "/auth/sign-in",
//   label = "Sign Out",
//   className = "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50",
// }: SignOutButtonProps) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);

//   const handleSignOut = async () => {
//     if (status === "loading") return;

//     setLoading(true);
//     try {
//       // 1. Wipe Redux State globally before ending the session
//       // This matches the reset logic in our store/index.ts
//       dispatch({ type: "auth/logout" });

//       // 2. Remove JWT cookie & end session
//       await signOut({ redirect: false });

//       // 3. Redirect to the provided path
//       router.push(redirectPath);
//     } catch (error) {
//       console.error("Sign-out error:", error);
//       setLoading(false);
//     }
//   };

//   if (!session?.user) return null;

//   return (
//     <button 
//       onClick={handleSignOut} 
//       disabled={loading} 
//       className={className}
//     >
//       {loading ? "Signing out..." : label}
//     </button>
//   );
// }




"use client";

import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function SignOutButton({ className, label }: { className?: string, label?: string }) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();

  const handleLogout = async () => {
    dispatch({ type: "app/logout" });
    notifySuccess("Logged out safely.");
    await signOut({ callbackUrl: "/", redirect: true });
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut size={16} />
      <span>{label || "Sign Out"}</span>
    </button>
  );
}
