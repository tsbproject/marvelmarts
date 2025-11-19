"use client";

import { createContext, useContext, ReactNode } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession as useNextAuthSession } from "next-auth/react";
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useNextAuthSession();

  return (
    <SessionContext.Provider value={{ session, status }}>
      <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
    </SessionContext.Provider>
  );
}
