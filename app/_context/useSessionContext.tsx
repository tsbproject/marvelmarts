// // "use client";

// // import { createContext, useContext, ReactNode } from "react";
// // import { useSession } from "next-auth/react";
// // import type { Session } from "next-auth"; 
// // // -------------------------
// // // Types
// // // -------------------------
// // interface SessionContextType {
// //   session: Session | null;
// //   status: "authenticated" | "unauthenticated" | "loading";
// // }

// // const SessionContext = createContext<SessionContextType>({
// //   session: null,
// //   status: "loading",
// // });

// // // -------------------------
// // // Provider
// // // -------------------------
// // export function SessionProvider({ children }: { children: ReactNode }) {
// //   const { data: session, status } = useSession();

// //   return (
// //     <SessionContext.Provider value={{ session, status }}>
// //       {children}
// //     </SessionContext.Provider>
// //   );
// // }

// // // -------------------------
// // // Hook
// // // -------------------------
// // export function useSessionContext() {
// //   return useContext(SessionContext);
// // }




// "use client";

// import { createContext, useContext, ReactNode } from "react";
// import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
// import type { Session } from "next-auth";

// interface SessionContextType {
//   session: Session | null;
//   status: "authenticated" | "unauthenticated" | "loading";
// }

// const SessionContext = createContext<SessionContextType>({
//   session: null,
//   status: "loading",
// });

// export function useSessionContext() {
//   return useContext(SessionContext);
// }

// function InnerSessionProvider({ children }: { children: ReactNode }) {
//   const { data: session, status } = useSession();
//   return (
//     <SessionContext.Provider value={{ session, status }}>
//       {children}
//     </SessionContext.Provider>
//   );
// }

// export function SessionProvider({ children }: { children: ReactNode }) {
//   return (
//     <NextAuthSessionProvider>
//       <InnerSessionProvider>{children}</InnerSessionProvider>
//     </NextAuthSessionProvider>
//   );
// }



"use client";

import { createContext, useContext, ReactNode } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionContextType {
  session: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
}

const SessionContext = createContext<SessionContextType>({
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
