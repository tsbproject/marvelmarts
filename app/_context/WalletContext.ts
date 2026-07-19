"use client";

import { createContext } from "react";

export interface FundWalletOptions {
  amount: number;
}

export interface WalletContextValue {
  loading: boolean;
  balance: number;
  refreshBalance(): Promise<void>;

  fundWallet(
    options: FundWalletOptions
  ): Promise<void>;
}

export const WalletContext =
  createContext<WalletContextValue | null>(
    null
  );


export interface FundWalletOptions {
  amount: number;
  onSuccess?: () => void;
}