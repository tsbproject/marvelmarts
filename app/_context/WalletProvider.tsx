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
  async ({ amount, onSuccess }: FundWalletOptions) => {
  
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





    const handler = window.PaystackPop.setup({
      key: data.publicKey,
      email: data.email,
      amount: Number(data.amount) * 100,
      currency: "NGN",
      ref: data.reference,
      callback: function (response: { reference: string }) {
        void (async () => {
          try {
            const verifyResponse = await fetch(
              "/api/wallet/fund/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reference: response.reference,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error ??
                verifyData.message ??
                "Wallet verification failed."
              );
            }

            await refreshBalance();

            onSuccess?.();

            // we'll add the remaining UI updates below
          } catch (error) {
            console.error(error);
          }
        })();
      },
      onClose: function () {
        setLoading(false);
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
}, [refreshBalance]);



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