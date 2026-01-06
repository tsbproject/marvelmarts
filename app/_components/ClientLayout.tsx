// // app/components/ClientLayout.tsx
// "use client";

// import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
// import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
// import { NotificationProvider } from "../_context/NotificationContext";
// import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
// import Header from "@/app/_components/Header";
// import Footer from "@/app/_components/Footer";
// import CategoryMenu from "@/app/_components/CategoryMenu"; // unified menu (Topbar on desktop, accordion on mobile)
// import NextTopLoader from "nextjs-toploader"; //progress bar

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <NextAuthSessionProvider>
//       <CustomSessionProvider>
//         <NotificationProvider>
//           <LoadingOverlayProvider>
          
//             <NextTopLoader
//               color="#2563eb"   
//               height={3}
//               showSpinner={false}
//               crawlSpeed={200}
//               easing="ease"
//               speed={200}
//             />

//             {/* Global header */}
//             <Header />

//             {/* Category navigation directly under header */}
//             <div className="hidden lg:block">
//               <CategoryMenu />
//             </div>

//             {/* Page content */}
//             <main className="min-h-screen p-4">
//               {children}
//             </main>

//             {/* Global footer */}
//             <Footer />
//           </LoadingOverlayProvider>
//         </NotificationProvider>
//       </CustomSessionProvider>
//     </NextAuthSessionProvider>
//   );
// }



// app/components/ClientLayout.tsx
"use client";

import { Provider, useDispatch } from "react-redux";
import { store } from "@/store";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionProvider as CustomSessionProvider } from "@/app/_context/useSessionContext";
import { NotificationProvider } from "../_context/NotificationContext";
import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CategoryMenu from "@/app/_components/CategoryMenu";
import NextTopLoader from "nextjs-toploader";
import { useEffect } from "react";
import { setUser } from "@/store/authSlice";

// Inner component to sync session → Redux
function ReduxSessionSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser(session.user));
    } else {
      dispatch(setUser(null));
    }
  }, [session, dispatch]);

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NextAuthSessionProvider>
        <CustomSessionProvider>
          <NotificationProvider>
            <LoadingOverlayProvider>
              <ReduxSessionSync>
                <NextTopLoader
                  color="#2563eb"
                  height={3}
                  showSpinner={false}
                  crawlSpeed={200}
                  easing="ease"
                  speed={200}
                />

                {/* Global header */}
                <Header />

                {/* Category navigation directly under header */}
                <div className="hidden lg:block">
                  <CategoryMenu />
                </div>

                {/* Page content */}
                <main className="min-h-screen p-4">{children}</main>

                {/* Global footer */}
                <Footer />
              </ReduxSessionSync>
            </LoadingOverlayProvider>
          </NotificationProvider>
        </CustomSessionProvider>
      </NextAuthSessionProvider>
    </Provider>
  );
}
