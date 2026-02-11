

import { Suspense } from "react";
import VerifyCustomerClient from "./VerifyCustomerClient";

export default function VerifyCustomerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <VerifyCustomerClient />
    </Suspense>
  );
}
