"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <CustomSessionProvider>

        <Header />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />

      </CustomSessionProvider>
    </NextAuthSessionProvider>
  );
}
