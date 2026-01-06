"use client";

import { createContext, useContext, ReactNode } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";

interface SessionContextProps {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const SessionContext = createContext<SessionContextProps>({
  session: null,
  status: "loading",
});

export function useSessionContext() {
  return useContext(SessionContext);
}

function InnerSessionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  return (
    <SessionContext.Provider value={{ session, status }}>
      {children}
    </SessionContext.Provider>
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <InnerSessionProvider>{children}</InnerSessionProvider>
    </NextAuthSessionProvider>
  );
}
