// "use client";

// import { useSession } from "next-auth/react";
// import { useEffect, useRef } from "react";

// /**
//  * SessionUpdater
//  * Ensures the client-side session reflects the latest database state 
//  * (like 'isVerified' or 'role' updates) after the component mounts.
//  */
// export default function SessionUpdater() {
//   const { status, update } = useSession();
//   const hasUpdated = useRef(false);

//   useEffect(() => {
//     // Only trigger update if we are authenticated and haven't updated in this mount cycle
//     if (status === "authenticated" && !hasUpdated.current) {
      
//       const refreshSession = async () => {
//         try {
//           // Triggers NextAuth to call the 'session' callback and refresh the cookie
//           await update();
//           hasUpdated.current = true;
//         } catch (error) {
//           console.error("Session sync failed:", error);
//         }
//       };

//       refreshSession();
//     }
//   }, [status, update]);

//   return null;
// }



// Updated SessionUpdater.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setViewMode } from "@/store/appSlice";

export default function SessionUpdater() {
  const { data: session, update } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user?.role) {
      // Sync Redux with the actual Session Role on load
      dispatch(setViewMode(session.user.role));
    }
  }, [session?.user?.role, dispatch]);

  useEffect(() => {
    // Refresh session data from DB once on mount
    update();
  }, []);

  return null;
}