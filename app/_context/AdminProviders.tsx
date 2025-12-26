"use client";

import { LoadingOverlayProvider } from "@/app/_context/LoadingOverlayContext";
import { NotificationProvider } from "@/app/_context/NotificationContext";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <LoadingOverlayProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </LoadingOverlayProvider>
  );
}
