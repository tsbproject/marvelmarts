"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface LoadingOverlayContextType {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const LoadingOverlayContext =
  createContext<LoadingOverlayContextType | undefined>(undefined);

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   *Normal Stop logic:
   * Stop spinner when route changes or query params change
   */
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  /**
   * Safety Fail-Safe (Emergency Brake):
   * On Vercel, if the browser thread is blocked or an intervention occurs, 
   * the normal useEffect might not fire immediately. 
   * This forces the overlay to hide after 5 seconds to prevent a "permanent freeze".
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false);
        console.warn("LoadingOverlay forced hide after 5s timeout.");
      }, 5000); // 5 seconds is plenty for a standard Vercel response
    }

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <LoadingOverlayContext.Provider value={{ loading, setLoading }}>
      {children}
      <AnimatePresence>
        {loading && <LoadingSpinner />}
      </AnimatePresence>
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const context = useContext(LoadingOverlayContext);
  if (!context) {
    throw new Error(
      "useLoadingOverlay must be used within LoadingOverlayProvider"
    );
  }
  return context;
}