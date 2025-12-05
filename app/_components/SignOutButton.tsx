"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignOutButtonProps = {
  redirectPath?: string; // optional path to redirect after sign-out
  label?: string; // button text
  className?: string; // optional styling
};

export default function SignOutButton({
  redirectPath = "/auth/sign-in",
  label = "Sign Out",
  className = "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50",
}: SignOutButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (status === "loading") return;

    setLoading(true);
    try {
      // Remove JWT cookie & end session
      await signOut({ redirect: false });

      // Redirect to the provided path
      router.push(redirectPath);
    } catch (error) {
      console.error("Sign-out error:", error);
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <button onClick={handleSignOut} disabled={loading} className={className}>
      {loading ? "Signing out..." : label}
    </button>
  );
}
