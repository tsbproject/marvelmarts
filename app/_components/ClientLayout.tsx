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

//   useEffect(() => {
//     // 1. HYDRATE CART (From LocalStorage)
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

//   useEffect(() => {
//     // 2. SYNC AUTH SESSION & FETCH WISHLIST
//     // Using 'loading' check ensures we don't clear the user while the session is still fetching
//     if (status === "authenticated" && session?.user) {
//       dispatch(
//         setUser({
//           id: session.user.id ?? "",
//           name: session.user.name ?? "",
//           email: session.user.email ?? "",
//           role: session.user.role,
//           permissions: session.user.permissions ?? {},
//         })
//       );

//       const fetchUserWishlist = async () => {
//         try {
//           const res = await fetch("/api/wishlist/get");
//           if (res.ok) {
//             const data = await res.json();
//             dispatch(setWishlist(data));
//           }
//         } catch (error) {
//           console.error("Error hydrating wishlist:", error);
//         }
//       };

//       fetchUserWishlist();
//     } 
    
//     // 3. HANDLE LOGOUT / UNAUTHENTICATED STATE
//     else if (status === "unauthenticated") {
//       dispatch(clearUser());
//       dispatch(setWishlist([])); 
//     }
//   }, [session, status, dispatch]);

//   return null;
// }

// /* --- Layout Component --- */

// interface SiteSettings {
//   footerDesc: string;
//   supportPhone: string;
//   supportEmail: string;
// }

// interface ClientLayoutProps {
//   children: React.ReactNode;
//   settings: SiteSettings;
//   initialCategories: CategoryWithChildren[];
//   session?: any; // Added to receive session from server component
// }



// export default function ClientLayout({
//   children,
//   settings,
//   initialCategories,
//   session, // Destructured session
// }: ClientLayoutProps) {
//   return (
//     <Provider store={store}>
//       {/* CRITICAL: Passing 'session' here hydrates the useSession() hook 
//           immediately on the client, fixing the "need to refresh" bug.
//       */}
//       <NextAuthSessionProvider session={session}>
//         <CustomSessionProvider>
//           <NotificationProvider>
//             <LoadingOverlayProvider>
//               {/* Background Sync Logic */}
//               <ReduxStateSync />

//               {/* Visual Progress Bar */}
//               <NextTopLoader
//                 color="#002B5B"
//                 height={3}
//                 showSpinner={false}
//                 crawlSpeed={200}
//                 easing="ease"
//                 speed={200}
//               />

//               {/* Site Structure */}
//               <Header initialCategories={initialCategories} />

//               <main className="min-h-screen">
//                 {children}
//               </main>

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
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
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
      // Immediate Redux Update for Auth State
      dispatch(
        setUser({
          id: session.user.id ?? "",
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          role: session.user.role,
          permissions: session.user.permissions ?? {},
        })
      );

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
    } 
    
    // Handle Logout State
    else if (status === "unauthenticated") {
      dispatch(clearUser());
      dispatch(setWishlist([])); 
    }
  }, [session, status, dispatch]); // session inclusion ensures reactivity on login/logout events

  return null;
}

/* --- Layout Component --- */

interface SiteSettings {
  footerDesc: string;
  supportPhone: string;
  supportEmail: string;
}

interface ClientLayoutProps {
  children: React.ReactNode;
  settings: SiteSettings;
  initialCategories: CategoryWithChildren[];
  session?: any; 
}



export default function ClientLayout({
  children,
  settings,
  initialCategories,
  session, 
}: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <NextAuthSessionProvider session={session}>
        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              {/* Background Sync Logic */}
              <ReduxStateSync />

              {/* Visual Progress Bar */}
              <NextTopLoader
                color="#002B5B"
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                easing="ease"
                speed={200}
              />

              {/* Site Structure */}
              <Header initialCategories={initialCategories} />

              <main className="min-h-screen">
                {children}
              </main>

              <Footer settings={settings} />
            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}