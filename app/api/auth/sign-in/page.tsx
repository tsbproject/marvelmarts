


// import { Suspense } from "react";
// import SignInForm from "./SignInForm";

// export default function SignInPage() {
//   return (
//     <Suspense fallback={<div>Loading sign-in…</div>}>
//       <SignInForm />
//     </Suspense>
//   );
// }

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SignInPage from "./SignInForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
