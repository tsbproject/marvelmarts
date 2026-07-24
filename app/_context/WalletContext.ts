"use client";

import { createContext } from "react";

export interface FundWalletOptions {
  amount: number;
  saveCard?: boolean;
  returnUrl: string;
  onSuccess?: () => void;
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
  createContext<WalletContextValue | null>(null);