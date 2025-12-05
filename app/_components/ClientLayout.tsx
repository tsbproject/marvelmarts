"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "../_context/NotificationContext";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <CustomSessionProvider>
        <NotificationProvider>
        <Header />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />
        </NotificationProvider>
      </CustomSessionProvider>
    </NextAuthSessionProvider>
  );
}
