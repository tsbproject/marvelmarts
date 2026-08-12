"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCw,
  Store,
  Clock,
  AlertCircle,
} from "lucide-react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useSession } from "next-auth/react";

import { setViewMode } from "@/store/appSlice";
import { RootState } from "@/store";

import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export default function BusinessToggleAction() {
  const [mounted, setMounted] =
    useState(false);

  const dispatch = useDispatch();

  const {
    data: session,
    status,
  } = useSession();

  const { notifySuccess } =
    useNotification();

  const { setLoading } =
    useLoadingOverlay();

  const viewMode = useSelector(
    (state: RootState) =>
      state.app.viewMode
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* ACCOUNT CAPABILITIES                                                   */
  /* ---------------------------------------------------------------------- */

  const roles =
    session?.user?.roles?.length
      ? session.user.roles
      : session?.user?.role
        ? [session.user.role]
        : [];

  const hasVendorRole =
    roles.includes("VENDOR");

  const hasVendorProfile =
    !!session?.user?.vendorProfileId;

  const hasVendorAccount =
    hasVendorRole ||
    hasVendorProfile;

  const vendorStatus =
    session?.user?.vendorStatus;

  const isSuspended =
    session?.user?.isSuspended ??
    false;

  /* ---------------------------------------------------------------------- */
  /* SWITCH TO VENDOR                                                       */
  /* ---------------------------------------------------------------------- */

  const handleSwitch = () => {
    if (
      status !== "authenticated" ||
      !session?.user
    ) {
      return;
    }

    setLoading(true);

    /*
     * No vendor capability/profile exists.
     * User must register first.
     */
    if (!hasVendorAccount) {
      window.location.assign(
        "/auth/register/vendor-signup"
      );

      return;
    }

    /*
     * Suspended vendors must never
     * activate normal vendor workspace.
     */
    if (isSuspended) {
      dispatch(
        setViewMode("VENDOR")
      );

      window.location.assign(
        "/account/vendor"
      );

      return;
    }

    /* ------------------------------------------------------------------ */
    /* VENDOR LIFECYCLE                                                   */
    /* ------------------------------------------------------------------ */

    switch (vendorStatus) {
      case "AWAITING_DOCUMENTS":
        dispatch(
          setViewMode("VENDOR")
        );

        window.location.assign(
          "/account/vendor/verification"
        );

        return;

      case "PENDING_REVIEW":
        dispatch(
          setViewMode("VENDOR")
        );

        window.location.assign(
          "/account/vendor"
        );

        return;

      case "REJECTED":
        dispatch(
          setViewMode("VENDOR")
        );

        window.location.assign(
          "/account/vendor"
        );

        return;

      case "APPROVED":
        dispatch(
          setViewMode("VENDOR")
        );

        notifySuccess(
          "Merchant Console Activated"
        );

        window.location.assign(
          "/account/vendor"
        );

        return;

      default:
        /*
         * Vendor profile/capability exists,
         * but its lifecycle state is not
         * usable yet.
         *
         * Do not fake vendor access.
         */
        setLoading(false);

        return;
    }
  };

  /* ---------------------------------------------------------------------- */
  /* HYDRATION GUARD                                                        */
  /* ---------------------------------------------------------------------- */

  if (!mounted) {
    return (
      <button
        disabled
        className="
          flex items-center gap-3
          px-6 py-4
          rounded-2xl
          font-black
          transition-all
          shadow-xl
          backdrop-blur-md
          uppercase
          text-sm
          tracking-widest
          border
          bg-white/10
          border-white/20
          text-white
          opacity-50
          cursor-not-allowed
        "
      >
        <RefreshCw
          size={20}
          className="
            animate-spin
            text-brand-primary
          "
        />

        Synchronizing...
      </button>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STATUS-SPECIFIC BUTTON                                                 */
  /* ---------------------------------------------------------------------- */

  if (
    vendorStatus ===
    "AWAITING_DOCUMENTS"
  ) {
    return (
      <button
        type="button"
        onClick={handleSwitch}
        className="
          flex items-center gap-3
          bg-brand-primary
          text-white
          px-6 py-4
          rounded-2xl
          font-black
          uppercase
          text-sm
          tracking-widest
          shadow-lg
          transition-all
          hover:scale-[1.02]
          active:scale-95
        "
      >
        <Store size={20} />

        Complete Vendor Registration
      </button>
    );
  }

  if (
    vendorStatus ===
    "PENDING_REVIEW"
  ) {
    return (
      <button
        type="button"
        onClick={handleSwitch}
        className="
          flex items-center gap-3
          bg-white/10
          border border-white/20
          text-white
          px-6 py-4
          rounded-2xl
          font-black
          uppercase
          text-sm
          tracking-widest
        "
      >
        <Clock size={20} />

        Vendor Review Pending
      </button>
    );
  }

  if (
    vendorStatus === "REJECTED"
  ) {
    return (
      <button
        type="button"
        onClick={handleSwitch}
        className="
          flex items-center gap-3
          bg-red-500/20
          border border-red-400/30
          text-white
          px-6 py-4
          rounded-2xl
          font-black
          uppercase
          text-sm
          tracking-widest
        "
      >
        <AlertCircle size={20} />

        Review Vendor Application
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={
        status !==
        "authenticated"
      }
      className="
        flex items-center gap-3
        bg-brand-primary
        hover:bg-orange-600
        text-white
        px-6 py-4
        rounded-2xl
        font-black
        transition-all
        shadow-lg
        hover:scale-[1.02]
        active:scale-95
        uppercase
        text-sm
        tracking-widest
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      <Store size={20} />

      Switch to Vendor View
    </button>
  );
}
