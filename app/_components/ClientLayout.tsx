


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
    } 
    else if (status === "unauthenticated") {
      dispatch(clearUser());
      dispatch(setWishlist([])); 
    }
  }, [session, status, dispatch]);

  return <></>;
}

/* --- Layout Component --- */

interface SiteSettings {
  siteName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bodyBg?: string;
  cardBg?: string;
  sidebarBg?: string;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  borderDefault?: string;
  baseFontSize?: number;
  headingFontSize?: number;
  bodyFontSize?: number;
  headerFontScale?: number;
  footerFontScale?: number;
  carouselFontScale?: number;
  fontFamily?: string;
  headingFont?: string;
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

  // --- DESIGN SYSTEM INJECTION ---
  // We apply these to a wrapper DIV so the UI reacts instantly to settings changes
  const dynamicStyles = {
    "--accent-navy": settings?.primaryColor || "#002B5B",
    "--brand-primary": settings?.secondaryColor || "#F7931E",
    "--brand-black": settings?.accentColor || "#1E1E1E",
    
    "--brand-ghost": settings?.bodyBg || "#F8F8F8",
    "--brand-white": settings?.cardBg || "#FFFFFF",
    "--sidebar-bg": settings?.sidebarBg || "#002B5B",
    
    "--success-color": settings?.successColor || "#10B981",
    "--error-color": settings?.errorColor || "#EF4444",
    "--warning-color": settings?.warningColor || "#FBBF24",
    "--border-main": settings?.borderDefault || "#E5E7EB",

    // This is the variable that allows the 10px root look
    "--base-font-size": `${settings?.baseFontSize || 10}px`, 
    "--heading-font-scale": settings?.headingFontSize || 1.0, 
    "--body-font-scale": settings?.bodyFontSize || 1.0,
    
    "--font-main": settings?.fontFamily || "Inter",
    "--font-heading": settings?.headingFont || "Outfit",

    "--header-font-scale": settings?.headerFontScale || 1.0,
    "--footer-font-scale": settings?.footerFontScale || 1.0,
    "--carousel-font-scale": settings?.carouselFontScale || 1.0,
  } as React.CSSProperties;

  return (
    <Provider store={store}>
      <NextAuthSessionProvider session={session}>
        <ReduxStateSync /> 
        
        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              
              {/* This wrapper div carries the style engine */}
              <div 
                id="design-system-root" 
                style={dynamicStyles} 
                className="min-h-screen bg-[var(--brand-ghost)] text-[var(--brand-black)]"
              >
                <NextTopLoader
                  color="var(--brand-primary)"
                  height={3}
                  showSpinner={false}
                  crawlSpeed={200}
                  easing="ease"
                  speed={200}
                />

                <Header initialCategories={initialCategories} />

                <main className="min-h-screen">
                  {children}
                </main>

                <Footer settings={settings} />
              </div>

            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}