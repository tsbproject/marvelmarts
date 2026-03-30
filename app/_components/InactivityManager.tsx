"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

const ROLE_TIMEOUTS: Record<Role, number> = {
  SUPER_ADMIN: 15 * 60 * 1000,
  ADMIN: 15 * 60 * 1000,
  VENDOR: 20 * 60 * 1000,
  CUSTOMER: 45 * 60 * 1000,
};

const WARNING_DURATION = 60 * 1000;

export default function InactivityManager() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const role = useMemo<Role>(() => {
    const currentRole = session?.user?.role;
    if (currentRole === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (currentRole === "ADMIN") return "ADMIN";
    if (currentRole === "VENDOR") return "VENDOR";
    return "CUSTOMER";
  }, [session?.user?.role]);

  const timeoutMs = ROLE_TIMEOUTS[role];

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  const performLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    setCountdown(60);

    await signOut({
      callbackUrl: `/auth/sign-in?reason=inactive&redirect=${encodeURIComponent(pathname || "/")}`,
    });
  }, [clearTimers, pathname]);

  const startCountdown = useCallback(() => {
    setCountdown(60);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetInactivity = useCallback(() => {
    if (status !== "authenticated") return;

    clearTimers();
    setShowWarning(false);
    setCountdown(60);

    const warningAt = Math.max(timeoutMs - WARNING_DURATION, 5_000);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningAt);

    logoutTimerRef.current = setTimeout(() => {
      void performLogout();
    }, timeoutMs);
  }, [status, timeoutMs, clearTimers, startCountdown, performLogout]);

  const stayLoggedIn = useCallback(async () => {
    setShowWarning(false);
    setCountdown(60);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    try {
      await update();
    } catch {
      // ignore refresh failures and still reset inactivity
    }

    resetInactivity();
  }, [resetInactivity, update]);

  useEffect(() => {
    if (status !== "authenticated") {
      clearTimers();
      setShowWarning(false);
      return;
    }

    resetInactivity();

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    let throttle = false;

    const handleActivity = () => {
      if (throttle) return;
      throttle = true;
      resetInactivity();
      window.setTimeout(() => {
        throttle = false;
      }, 1000);
    };

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [status, resetInactivity, clearTimers]);

  if (status !== "authenticated" || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white border border-gray-100 shadow-2xl p-8 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <AlertTriangle className="text-brand-primary" size={30} />
        </div>

        <h2 className="text-2xl font-black uppercase italic text-accent-navy mb-3">
          Session Expiring
        </h2>

        <p className="text-sm font-medium text-neutral-gray mb-6 leading-relaxed">
          You’ve been inactive for a while. For security, you’ll be logged out soon.
        </p>

        <div className="mb-6 rounded-2xl bg-neutral-light border border-neutral-200 p-4 flex items-center justify-center gap-3">
          <Clock size={18} className="text-brand-primary" />
          <span className="text-lg font-black text-accent-navy">
            {countdown}s remaining
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={stayLoggedIn}
            className="w-full py-4 rounded-2xl bg-accent-navy text-white font-black uppercase text-xs tracking-[0.15em] hover:bg-brand-primary transition-all active:scale-[0.98]"
          >
            Stay Logged In
          </button>

          <button
            type="button"
            onClick={() => void performLogout()}
            className="w-full py-4 rounded-2xl border border-gray-200 text-neutral-gray font-black uppercase text-xs tracking-[0.15em] hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}