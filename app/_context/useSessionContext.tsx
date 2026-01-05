"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth"; //import Session type from core package

// -------------------------
// Types
// -------------------------
interface SessionContextType {
  session: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  status: "loading",
});

// -------------------------
// Provider
// -------------------------
export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <SessionContext.Provider value={{ session, status }}>
      {children}
    </SessionContext.Provider>
  );
}

// -------------------------
// Hook
// -------------------------
export function useSessionContext() {
  return useContext(SessionContext);
}