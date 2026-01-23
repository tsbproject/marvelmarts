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

/**
 * Syncs the NextAuth session and initializes the cart from LocalStorage
 */
function ReduxStateSync() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    // Sync Auth Session
    if (session?.user) {
      dispatch(
        setUser({
          ...session.user,
          name: session.user.name ?? "",
        })
      );
    } else {
      dispatch(setUser(null));
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

// Destructure initialCategories from props here
export default function ClientLayout({ 
  children, 
  settings, 
  initialCategories 
}: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <NextAuthSessionProvider>
        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              {/* Syncs Session & Global State */}
              <ReduxStateSync />

              <NextTopLoader
                color="#002B5B" 
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                easing="ease"
                speed={200}
              />

              <Header />

              <div className="">
                {/*Pass the initialCategories prop to the CategoryMenu */}
                <CategoryMenu initialCategories={initialCategories} />
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