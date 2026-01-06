

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
   * ✅ Stop spinner when:
   * - initial page mounts
   * - route changes
   * - query params change (pagination, search, filters)
   */
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

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
