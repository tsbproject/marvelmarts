"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

const WARNING_SECONDS = 60;

const ROLE_TIMEOUTS: Record<Role, number> = {
  SUPER_ADMIN: 15 * 60 * 1000,
  ADMIN: 15 * 60 * 1000,
  VENDOR: 20 * 60 * 1000,
  CUSTOMER: 45 * 60 * 1000,
};

export default function InactivityManager() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const role = useMemo<Role>(() => {
    const currentRole = (session?.user as any)?.role;
    if (currentRole === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (currentRole === "ADMIN") return "ADMIN";
    if (currentRole === "VENDOR") return "VENDOR";
    return "CUSTOMER";
  }, [session]);

  const timeoutMs = ROLE_TIMEOUTS[role];

  const clearAllTimers = useCallback(() => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    warningTimeoutRef.current = null;
    logoutTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  const doLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(WARNING_SECONDS);

    await signOut({
      callbackUrl: `/auth/sign-in?reason=inactive&redirect=${encodeURIComponent(pathname || "/")}`,
    });
  }, [clearAllTimers, pathname]);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setSecondsLeft(WARNING_SECONDS);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startInactivityTimers = useCallback(() => {
    if (status !== "authenticated") return;

    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(WARNING_SECONDS);

    const warningMs = timeoutMs - WARNING_SECONDS * 1000;

    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningMs);

    logoutTimeoutRef.current = setTimeout(() => {
      void doLogout();
    }, timeoutMs);
  }, [status, timeoutMs, clearAllTimers, startCountdown, doLogout]);

  const stayLoggedIn = useCallback(() => {
    setShowWarning(false);
    setSecondsLeft(WARNING_SECONDS);
    startInactivityTimers();
  }, [startInactivityTimers]);

  useEffect(() => {
    if (status !== "authenticated") {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    startInactivityTimers();

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    let throttled = false;

    const handleActivity = () => {
      if (throttled) return;
      throttled = true;

      startInactivityTimers();

      window.setTimeout(() => {
        throttled = false;
      }, 1000);
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [status, startInactivityTimers, clearAllTimers]);

  useEffect(() => {
    console.log("INACTIVITY MANAGER:", {
      status,
      role,
      timeoutMs,
      showWarning,
      secondsLeft,
      email: session?.user?.email,
    });
  }, [status, role, timeoutMs, showWarning, secondsLeft, session]);

  if (status !== "authenticated") return null;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white border border-gray-100 shadow-2xl p-8 text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="text-brand-primary" size={30} />
            </div>

            <h2 className="text-2xl font-black uppercase italic text-accent-navy mb-3">
              Session Expiring
            </h2>

            <p className="text-sm font-medium text-neutral-gray mb-6 leading-relaxed">
              You’ve been inactive for a while. You will be logged out soon for security.
            </p>

            <div className="mb-6 rounded-2xl bg-neutral-light border border-neutral-200 p-4 flex items-center justify-center gap-3">
              <Clock size={18} className="text-brand-primary" />
              <span className="text-lg font-black text-accent-navy">
                {secondsLeft}s remaining
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
                onClick={() => void doLogout()}
                className="w-full py-4 rounded-2xl border border-gray-200 text-neutral-gray font-black uppercase text-xs tracking-[0.15em] hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}