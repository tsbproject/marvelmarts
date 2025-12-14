// app/auth/error/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    AccessDenied: "You do not have permission to sign in.",
    Configuration: "Authentication is not configured correctly.",
    Default: "An unexpected error occurred. Please try again later.",
  };

  const message = error ? errorMessages[error] ?? errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Sign‑in Error</h1>
        <p className="text-gray-700 mb-6">{message}</p>
        <Link
          href="/auth/sign-in"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Sign‑in
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading error page…</div>}>
      <ErrorContent />
    </Suspense>
  );
}
