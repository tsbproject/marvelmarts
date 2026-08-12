"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  ShoppingCart,
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

  const { status, data: session } =
    useSession();

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

  const hasCustomerRole =
    roles.includes("CUSTOMER");

  /* ---------------------------------------------------------------------- */
  /* SWITCH TO SHOPPING                                                     */
  /* ---------------------------------------------------------------------- */

  const handleSwitch = () => {
    if (
      status !== "authenticated" ||
      !session?.user
    ) {
      return;
    }

    /*
     * A workspace switch must NEVER modify
     * session.user.role.
     *
     * The role/roles in NextAuth represent
     * actual account capabilities.
     */

    if (!hasCustomerRole) {
      /*
       * This account has not yet satisfied
       * the CUSTOMER account condition.
       *
       * Do not activate CUSTOMER workspace.
       */

      setLoading(true);

      window.location.assign(
        "/auth/register/customer-signup?redirect=%2Faccount%2Fcustomer"
      );

      return;
    }

    setLoading(true);

    dispatch(
      setViewMode("CUSTOMER")
    );

    notifySuccess(
      "Marketplace View Activated"
    );

    window.location.assign(
      "/account/customer"
    );
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
            opacity-50
          "
        />

        Synchronizing...
      </button>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* VENDOR → CUSTOMER SWITCH                                               */
  /* ---------------------------------------------------------------------- */

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
        px-6 py-4
        rounded-2xl
        font-black
        transition-all
        shadow-xl
        backdrop-blur-md
        group
        uppercase
        text-sm
        tracking-widest
        border
        bg-accent-navy
        text-white
        border-accent-navy
        hover:bg-[#003d82]
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      <ShoppingCart
        size={20}
        className="
          text-brand-primary
        "
      />

      {hasCustomerRole
        ? "Back to Shopping"
        : "Activate Shopping Account"}
    </button>
  );
}