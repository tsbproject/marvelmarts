"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionUpdater() {
  const { update } = useSession();

  useEffect(() => {
    // This triggers NextAuth to re-fetch the user data (role/verified status)
    // without forcing a full page reload.
    update();
  }, [update]);

  return null;
}