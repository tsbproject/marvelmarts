"use client";

import { useContext } from "react";

import {
  WalletContext,
} from "@/app/_context/WalletContext";

export function useWallet() {
  const context =
    useContext(
      WalletContext
    );

  if (!context) {
    throw new Error(
      "useWalletFunding must be used inside WalletFundingProvider."
    );
  }

  return context;
}