"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setVendorData } from "@/store/vendorSlice"; 
// Import other slices if needed, e.g., setUserData

export const useAuthSync = () => {
  const { data: session, status, update } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // 1. Update Redux with the latest session data
      dispatch(setVendorData({
        profile: session.user,
        balance: Number(session.user.balance || 0),
        onboarding: {
          profileDone: !!session.user.name,
          storeDone: !!session.user.vendorStatus,
          productDone: true, 
          payoutsDone: !!session.user.vendorProfileId,
        }
      }));
    }
  }, [session, status, dispatch]);

  // Return the update function so components can trigger a 
  // manual re-sync from the DB easily.
  return { session, status, refreshAuth: update };
};