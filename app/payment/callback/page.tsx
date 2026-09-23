"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { clearCheckoutAttemptId } from "@/app/lib/checkout/create-order";


export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        router.replace("/account/customer/payment-methods");
        return;
      }

      try {
        const response = await fetch(
         "/api/payments/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference,
            }),
          }
        );

        const data = await response.json();

       if (!response.ok || !data.success) {
  throw new Error(
    data.error ??
      data.message ??
      "Payment verification failed."
  );
    }

    clearCheckoutAttemptId();

    router.replace(
      data.returnUrl ??
        "/account/customer/payment-methods"
    );
       
      } catch (error) {
        console.error(error);

        router.replace(
          "/account/customer/payment-methods"
        );
      }
    };

    void verify();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <Loader2
          className="h-12 w-12 animate-spin text-brand-primary"
        />

        <div>
          <h1 className="text-2xl font-black text-accent-navy">
            Verifying Payment...
          </h1>

          <p className="mt-2 text-sm text-neutral-gray">
            Please wait while we securely verify your payment.
          </p>
        </div>
      </div>
    </div>
  );
}