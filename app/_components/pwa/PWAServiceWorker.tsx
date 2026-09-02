"use client";

import { useEffect } from "react";

export default function PWAServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
        .then((registration) => {
          console.info(
            "MarvelMarts service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "MarvelMarts service worker registration failed:",
            error
          );
        });
    });
  }, []);

  return null;
}