"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";


import {
  WalletContext,
  FundWalletOptions,
} from "./WalletContext";



type Props = {
  children: React.ReactNode;
};

export default function WalletProvider({
  children,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [balance, setBalance] = useState(0);


 const refreshBalance = useCallback(async () => {
  try {
    const response = await fetch("/api/wallet");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ??
        data.message ??
        "Failed to load wallet balance."
      );
    }

setBalance(Number(data.balance ?? 0));
  } catch (error) {
    console.error(error);
    setBalance(0);
  }
}, []);

 const fundWallet = useCallback(
  async ({
  amount,
  saveCard = false,
  returnUrl,
  onSuccess,
}: FundWalletOptions) => {
  
  try {
    setLoading(true);

    const response = await fetch(
      "/api/wallet/fund/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
       body: JSON.stringify({
        amount,
        saveCard,
        returnUrl,
      }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ??
        data.message ??
        "Unable to initialize wallet funding."
      );
    }





    const redirectUrl =
      data.authorizationUrl ?? data.url;

    if (!redirectUrl) {
      throw new Error(
        "Payment gateway URL not returned."
      );
    }

   onSuccess?.();
window.location.href = redirectUrl;
return;

  
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
}, []);



const value = useMemo(
  () => ({
    loading,
    balance,
    refreshBalance,
    fundWallet,
  }),
  [loading, balance, refreshBalance, fundWallet]
);

  return (
    <WalletContext.Provider
      value={value}
    >
      {children}
    </WalletContext.Provider>
  );
}