"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface LoadingOverlayContextType {
  setLoading: (value: boolean) => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | undefined>(undefined);

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingOverlayContext.Provider value={{ setLoading }}>
      {children}
      <AnimatePresence>{loading && <LoadingSpinner />}</AnimatePresence>
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const context = useContext(LoadingOverlayContext);
  if (!context) {
    throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
  }
  return context;
}
