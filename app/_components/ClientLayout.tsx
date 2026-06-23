"use client";

import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "@/app/_context/NotificationContext";
import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
import InactivityManager from "@/app/_components/InactivityManager";
import MobileBottomNav from "@/app/_components/home/MobileBottomNav";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import NextTopLoader from "nextjs-toploader";
import { setUser, clearUser } from "@/store/authSlice";
import { setWishlist } from "@/store/wishlistSlice";
import { hydrateCart } from "@/store/cartSlice";
import { Loader2 } from "lucide-react";

function ReduxStateSync({ onReady }: { onReady: () => void }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("marvel_cart");
      if (savedCart) {
        try {
          dispatch(hydrateCart(JSON.parse(savedCart)));
        } catch {
          localStorage.removeItem("marvel_cart");
        }
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      dispatch(setUser({
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as any).role,
        permissions: (session.user as any).permissions || {},
        isSuspended: (session.user as any).isSuspended ?? false,
      } as any));

      const fetchUserWishlist = async () => {
        try {
          const res = await fetch("/api/wishlist/get");
          if (res.ok) {
            dispatch(setWishlist(await res.json()));
          }
        } catch (error) {
          console.error("Error hydrating wishlist:", error);
        } finally {
          onReady();
        }
      };

      fetchUserWishlist();
      return;
    }

    dispatch(clearUser());
    dispatch(setWishlist([]));
    onReady();
  }, [session, status, dispatch, onReady]);

  return null;
}

export default function ClientLayout({
  children,
  initialCategories,
  session,
}: {
  children: React.ReactNode;
  initialCategories: any[];
  session?: any;
}) {
  const [authReady, setAuthReady] = useState(false);

  return (
    <Provider store={store}>
      <NextAuthSessionProvider session={session}>
        <ReduxStateSync onReady={() => setAuthReady(true)} />
           <InactivityManager />


        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              <NextTopLoader
                color="#002B5B"
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                easing="ease"
                speed={200}
              />

              <Header initialCategories={initialCategories} />

             <main className="min-h-screen pb-20 md:pb-0">
                {authReady ? (
                  children
                ) : (
                  <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  </div>
                )}
              </main>
              <MobileBottomNav />
              <Footer />
            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}
