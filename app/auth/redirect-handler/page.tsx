// app/auth/redirect-handler/page.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      // Not logged in, redirect to sign-in
      router.replace("/auth/sign-in");
      return;
    }

    // Redirect based on role
    switch (session.user.role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        router.replace("/dashboard/admins");
        break;
      case "VENDOR":
        router.replace("/account/vendor");
        break;
      case "CUSTOMER":
        router.replace("/account/customer");
        break;
      default:
        router.replace("/"); // fallback
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Redirecting...</p>
    </div>
  );
}

