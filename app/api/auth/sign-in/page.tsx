// import LoginForm from '@/app/_components/LoginForm';

// export default function SignInPage() {
//   return <LoginForm />;
// }


import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading sign-in…</div>}>
      <SignInForm />
    </Suspense>
  );
}