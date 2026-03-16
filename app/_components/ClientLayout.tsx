


// "use client";

// import React, { useEffect } from "react";
// import { Provider, useDispatch } from "react-redux";
// import { store } from "@/store";
// import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
// import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
// import { NotificationProvider } from "@/app/_context/NotificationContext";
// import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
// import Header from "@/app/_components/Header";
// import Footer from "@/app/_components/Footer";
// // import SupportDrawer from "@/app/_components/SupportDrawer"; 
// import NextTopLoader from "nextjs-toploader";

// // Store Actions
// import { setUser, clearUser } from "@/store/authSlice";
// import { setWishlist } from "@/store/wishlistSlice";
// import { hydrateCart } from "@/store/cartSlice";

// // Types
// import { CategoryWithChildren } from "../layout";

// /**
//  * Syncs the NextAuth session, hydrates the Cart from localStorage, 
//  * and hydrates the Wishlist from the Database.
//  */
// function ReduxStateSync() {
//   const { data: session, status } = useSession();
//   const dispatch = useDispatch();
  
//   // 1. HYDRATE CART (From LocalStorage) - Runs once on mount
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedCart = localStorage.getItem("marvel_cart");
//       if (savedCart) {
//         try {
//           const items = JSON.parse(savedCart);
//           dispatch(hydrateCart(items));
//         } catch (error) {
//           console.error("Error hydrating cart:", error);
//           localStorage.removeItem("marvel_cart");
//         }
//       }
//     }
//   }, [dispatch]);


//   // 2. SYNC AUTH SESSION & FETCH WISHLIST
//     useEffect(() => {
//       if (status === "authenticated" && session?.user) {
//         const userPayload = {
//           id: (session.user as any).id || "",
//           name: session.user.name || "",
//           email: session.user.email || "",
//           role: (session.user as any).role, // Ensure this matches UserRole enum
//           permissions: (session.user as any).permissions || {},
//           isSuspended: (session.user as any).isSuspended ?? false,
//         };

//         // Use type assertion if the slice is being stubborn
//         dispatch(setUser(userPayload as any));

//         const fetchUserWishlist = async () => {
//           try {
//             const res = await fetch("/api/wishlist/get");
//             if (res.ok) {
//               const data = await res.json();
//               dispatch(setWishlist(data));
//             }
//           } catch (error) {
//             console.error("Error hydrating wishlist:", error);
//           }
//         };

//         fetchUserWishlist();
//       } 
//       else if (status === "unauthenticated") {
//         dispatch(clearUser());
//         dispatch(setWishlist([])); 
//       }
//     }, [session, status, dispatch]);

//   return <></>;
//   }

//   /* --- Layout Component --- */

// interface SiteSettings {
//   footerDesc: string;
//   supportPhone: string;
//   supportEmail: string;
// }

// interface ClientLayoutProps {
//   children: React.ReactNode;
//   settings: SiteSettings;
//   initialCategories: CategoryWithChildren[];
//   session?: any; 
// }

// export default function ClientLayout({
//   children,
//   settings,
//   initialCategories,
//   session, 
// }: ClientLayoutProps) {
//   return (
//     <Provider store={store}>
//       {/* Everything using useSession() must be INSIDE NextAuthSessionProvider. */}
//       <NextAuthSessionProvider session={session}>
//         <ReduxStateSync /> 
        
//         <CustomSessionProvider>
//           <NotificationProvider>
//             <LoadingOverlayProvider>
              
//               <NextTopLoader
//                 color="#002B5B"
//                 height={3}
//                 showSpinner={false}
//                 crawlSpeed={200}
//                 easing="ease"
//                 speed={200}
//               />

//               <Header initialCategories={initialCategories} />

//               <main className="min-h-screen">
//                 {children}
//               </main>

//               {/* Support Drawer - Placed here to float above Footer but stay within context providers */}
//               {/* <SupportDrawer /> */}

//               <Footer settings={settings} />
              
//             </LoadingOverlayProvider>
//           </NotificationProvider>
//         </CustomSessionProvider>
//       </NextAuthSessionProvider>
//     </Provider>
//   );
// }



"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "@/app/_context/NotificationContext";
import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
// import { GlobalSettingsProvider } from "@/app/_context/GlobalSettingsContext"; 
// import DynamicStyles from "@/app/_components/DynamicStyles"; 
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
// import SupportDrawer from "@/app/_components/SupportDrawer"; 
import NextTopLoader from "nextjs-toploader";

// Store Actions
import { setUser, clearUser } from "@/store/authSlice";
import { setWishlist } from "@/store/wishlistSlice";
import { hydrateCart } from "@/store/cartSlice";

// Types
import { CategoryWithChildren } from "../layout";

/**
 * Syncs the NextAuth session, hydrates the Cart from localStorage, 
 * and hydrates the Wishlist from the Database.
 */
function ReduxStateSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // 1. HYDRATE CART (From LocalStorage) - Runs once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("marvel_cart");
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          dispatch(hydrateCart(items));
        } catch (error) {
          console.error("Error hydrating cart:", error);
          localStorage.removeItem("marvel_cart");
        }
      }
    }
  }, [dispatch]);

  // 2. SYNC AUTH SESSION & FETCH WISHLIST
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userPayload = {
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role,
        permissions: (session.user as any).permissions || {},
        isSuspended: (session.user as any).isSuspended ?? false,
      };

      dispatch(setUser(userPayload as any));

      const fetchUserWishlist = async () => {
        try {
          const res = await fetch("/api/wishlist/get");
          if (res.ok) {
            const data = await res.json();
            dispatch(setWishlist(data));
          }
        } catch (error) {
          console.error("Error hydrating wishlist:", error);
        }
      };

      fetchUserWishlist();
    } else if (status === "unauthenticated") {
      dispatch(clearUser());
      dispatch(setWishlist([]));
    }
  }, [session, status, dispatch]);

  return null; // ← Changed from <></> to null (cleaner)
}

/* ────────────────────────────────────────────────────────────────
   MAIN CLIENT LAYOUT COMPONENT
─────────────────────────────────────────────────────────────────── */

// interface SiteSettings {
//   footerDesc: string;
//   supportPhone: string;
//   supportEmail: string;
//   // You can add more fields later (accentNavy, layoutScale, etc.)
// }

interface ClientLayoutProps {
  children: React.ReactNode;
  // settings: SiteSettings;
  initialCategories: CategoryWithChildren[];
  session?: any;
}

export default function ClientLayout({
  children,
  // settings,
  initialCategories,
  session,
}: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <NextAuthSessionProvider session={session}>
        {/* Sync auth, cart, wishlist */}
        <ReduxStateSync />

        {/* Custom session context */}
        <CustomSessionProvider>
          {/* Notifications */}
          <NotificationProvider>
            {/* Loading overlay */}
            <LoadingOverlayProvider>
              {/* ── GLOBAL SETTINGS & DYNAMIC STYLES ── */}
              {/* <GlobalSettingsProvider> */}
                {/* <DynamicStyles /> */}

                {/* Progress bar */}
                <NextTopLoader
                  color="#002B5B"
                  height={3}
                  showSpinner={false}
                  crawlSpeed={200}
                  easing="ease"
                  speed={200}
                />

                {/* Header */}
                <Header initialCategories={initialCategories} />

                {/* Main content */}
                <main className="min-h-screen">
                  {children}
                </main>

                {/* Optional: Support Drawer – uncomment when ready */}
                {/* <SupportDrawer /> */}

                {/* Footer */}
                {/* <Footer settings={settings} /> */}
                  <Footer />
              {/* </GlobalSettingsProvider> */}
            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}




