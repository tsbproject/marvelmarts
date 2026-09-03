




"use client";

import { useEffect, useState } from "react";
import {
  Download,
  X,
  Share,
  Plus,
  Smartphone,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] =
    useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & {
          standalone?: boolean;
        }).standalone
      );

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    setIsIOS(ios);

        const mobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 &&
            /Macintosh/i.test(navigator.userAgent));

        setIsMobile(mobile);


       setIsMobile(mobile);

    const wasDismissed =
      localStorage.getItem(
        "marvelmarts-pwa-dismissed"
      ) === "true";

    if (wasDismissed) {
      setDismissed(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setDismissed(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const dismissInstall = () => {
    setDismissed(true);

    localStorage.setItem(
      "marvelmarts-pwa-dismissed",
      "true"
    );
  };

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const { outcome } =
      await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

    if (
    isInstalled ||
    dismissed ||
    !isMobile ||
    (!installPrompt && !isIOS)
    ) {
    return null;
    }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[70] md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-brand-primary/10 bg-white p-4 shadow-2xl">
        <button
          type="button"
          onClick={dismissInstall}
          aria-label="Dismiss install prompt"
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-primary">
              <img
                src="/icon-192.png"
                alt="MarvelMarts"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-brand-black">
                Install MarvelMarts
              </h2>

              <p className="text-xs text-gray-500">
                Shop faster with MarvelMarts on your device.
              </p>
            </div>
          </div>

          {installPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Install MarvelMarts
            </button>
          )}

          {isIOS && !showIOSInstructions && (
            <button
              type="button"
              onClick={() =>
                setShowIOSInstructions(true)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Add to Home Screen
            </button>
          )}

          {isIOS && showIOSInstructions && (
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-brand-primary" />

                  <p className="text-sm font-bold text-brand-black">
                    Add MarvelMarts to your Home Screen
                  </p>
                </div>

                <ol className="space-y-3 text-sm leading-5 text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                      1
                    </span>

                    <span>
                      Tap Safari&apos;s{" "}
                      <Share className="mx-1 inline h-4 w-4 align-text-bottom text-brand-primary" />{" "}
                      <strong>Share</strong> button.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                      2
                    </span>

                    <span>
                      Scroll down and tap{" "}
                      <strong>
                        Add to Home Screen
                      </strong>
                      .
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                      3
                    </span>

                    <span>
                      Tap <strong>Add</strong> to finish.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-brand-primary/10 bg-brand-primary/5 p-3">
                <Plus className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />

                <p className="text-xs leading-5 text-gray-600">
                  MarvelMarts will then appear on your
                  Home Screen like an app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}