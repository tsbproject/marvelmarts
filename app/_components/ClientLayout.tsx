"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "@/app/_context/NotificationContext";
import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CategoryMenu from "@/app/_components/CategoryMenu";
import { CategoryWithChildren } from "../layout";
import NextTopLoader from "nextjs-toploader";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { setWishlist } from "@/store/wishlistSlice";
import { hydrateCart } from "@/store/cartSlice"; // Imported the new action

/**
 * Syncs the NextAuth session, hydrates the Cart from localStorage, 
 * and hydrates the Wishlist from the Database.
 */
function ReduxStateSync() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. HYDRATE CART (From LocalStorage)
    // We do this first so the UI reflects the user's saved items immediately
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

    // 2. SYNC AUTH SESSION
       if (session?.user) {
  dispatch(
    setUser({
      ...session.user,
      id: session.user.id ?? "",
      name: session.user.name ?? "",
      email: session.user.email ?? "", // Add this fallback to fix the build error
      role: session.user.role,
      permissions: session.user.permissions,
    })
  );
}

      // 3. FETCH WISHLIST (From Database on login/refresh)
      const fetchUserWishlist = async () => {
        try {
          const res = await fetch("/api/wishlist/get");
          if (res.ok) {
            const data = await res.json();
            // Data should be an array of formatted products
            dispatch(setWishlist(data));
          }
        } catch (error) {
          console.error("Error hydrating wishlist:", error);
        }
      };

      fetchUserWishlist();
    } else {
      dispatch(setUser(null));
      // Optional: dispatch(setWishlist([]));
    }
  }, [session, dispatch]);

  return null;
}

interface SiteSettings {
  footerDesc: string;
  supportPhone: string;
  supportEmail: string;
}

interface ClientLayoutProps {
  children: React.ReactNode;
  settings: SiteSettings;
  initialCategories: CategoryWithChildren[];
}

export default function ClientLayout({
  children,
  settings,
  initialCategories,
}: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <NextAuthSessionProvider>
        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              {/* This component handles all the data syncing in the background */}
              <ReduxStateSync />

              <NextTopLoader
                color="#002B5B"
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                easing="ease"
                speed={200}
              />

              {/* Keep existing styles and structure intact */}
              <Header initialCategories={initialCategories} />

              <div className="">
                {/*Pass the initialCategories prop to the CategoryMenu if needed */}
                {/* <CategoryMenu initialCategories={initialCategories} /> */}
              </div>

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