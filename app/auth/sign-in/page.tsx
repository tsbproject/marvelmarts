import { Suspense } from "react";
import SignInForm from "@/app/_components/SignInForm";

export const dynamic = "force-dynamic"; // ✅ skip prerender

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}


