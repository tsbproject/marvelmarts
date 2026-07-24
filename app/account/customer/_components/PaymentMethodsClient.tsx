"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import {
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/app/_actions/payment";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { useNotification } from "@/app/_context/NotificationContext";
import { useWallet } from "@/app/hooks/UseWallet";

import QuickFundModal from "@/app/_components/wallet/QuickFundModal";

interface PaymentMethod {
  id: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description: string | null;
  createdAt: string;
}

interface PaymentMethodsClientProps {
  initialCards: PaymentMethod[];
  walletBalance: number;
  transactions: WalletTransaction[];
}

export default function PaymentMethodsClient({
  initialCards,
  walletBalance,
  transactions,
}: PaymentMethodsClientProps) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotification();
  const { fundWallet } = useWallet();

  const [cards, setCards] = useState<PaymentMethod[]>(
    initialCards ?? []
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  useEffect(() => {
    setCards(initialCards ?? []);
  }, [initialCards]);

  const handleSetDefault = async (methodId: string) => {
    setIsPending(true);

    try {
      const result = await setDefaultPaymentMethod(methodId);

      if (!result.success) {
        notifyError(
          result.error ?? "Failed to update default payment method."
        );
        return;
      }

      setCards((currentCards) =>
        currentCards.map((card) => ({
          ...card,
          isDefault: card.id === methodId,
        }))
      );

      notifySuccess("Primary payment method updated.");
      router.refresh();
    } catch {
      notifyError("Something went wrong while updating your card.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    setIsPending(true);

    try {
      const result = await deletePaymentMethod(cardId);

      if (!result.success) {
        notifyError(result.error ?? "Failed to delete payment method.");
        return;
      }

      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardId)
      );
      setDeletingId(null);
      notifySuccess("Payment method removed.");
    } catch {
      notifyError("Something went wrong while deleting the card.");
    } finally {
      setIsPending(false);
    }
  };

  const handleFundWallet = (
  amount: number,
  saveCard: boolean
) => {
  void fundWallet({
    amount,
    saveCard,
    returnUrl: "/account/customer/payment-methods",
    onSuccess: () => {
      setIsFundModalOpen(false);

      notifySuccess(
        saveCard
          ? "Redirecting to Paystack. Your card will be saved after payment."
          : "Redirecting to Paystack to fund your wallet."
      );
    },
  });
};
  const formatTransactionAmount = (transaction: WalletTransaction) => {
    const isTopUp = transaction.type === "TOPUP";

    return `${isTopUp ? "+" : "-"} ₦${Number(
      transaction.amount
    ).toLocaleString()}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <DashboardHeader title="Payment Methods" showLogout />

      <QuickFundModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onSuccess={handleFundWallet}
      />

      <main className="space-y-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 md:p-10">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-accent-navy p-8 text-white shadow-2xl md:rounded-[3.5rem] md:p-16">
          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
                <Lock size={12} className="text-brand-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light">
                  Secure payments
                </span>
              </div>

              <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter md:text-4xl">
                Wallet &amp;{" "}
                <span className="text-brand-primary">Billing</span>
              </h2>

              <p className="max-w-sm text-sm font-medium uppercase tracking-tight text-blue-100/70 md:text-lg">
                Manage your wallet, saved cards, and payment preferences.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFundModalOpen(true)}
              className="flex items-center gap-3 self-start rounded-2xl bg-brand-primary px-5 py-4 text-sm font-black uppercase italic text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-primary/90"
            >
              <Plus size={20} />
              Fund Wallet
            </button>
          </div>

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-primary/20 blur-[120px]" />
        </section>

        <section className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[2.5rem] bg-brand-primary p-8 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Marvel Wallet
              </p>
              <h3 className="mt-2 text-3xl font-bold">
                ₦
                {walletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>

            <div className="rounded-xl bg-white/20 p-2">
              <Wallet size={24} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFundModalOpen(true)}
            className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 font-black text-brand-primary transition-all hover:bg-white/90"
          >
            <Plus size={18} />
            Top Up Wallet
          </button>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-accent-navy">
                Saved Cards
              </h3>

              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-gray/50">
                {cards.length} {cards.length === 1 ? "Card" : "Cards"} Found
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.id}
                  className={`relative overflow-hidden rounded-[2.5rem] border px-8 py-6 shadow-sm transition-all duration-300 hover:shadow-xl ${
                    card.isDefault
                      ? "border-brand-primary/30 bg-white ring-1 ring-brand-primary/10"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  {deletingId === card.id && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="mb-2 text-red-500" size={32} />
                      <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent-navy">
                        Remove this card?
                      </p>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          disabled={isPending}
                          className="rounded-2xl bg-gray-100 p-3 text-neutral-gray transition-all hover:bg-gray-200 disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(card.id)}
                          disabled={isPending}
                          className="rounded-2xl bg-red-600 p-3 text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mb-12 flex items-start justify-between">
                    {card.isDefault ? (
                      <span className="rounded-md bg-brand-primary px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetDefault(card.id)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-neutral-gray transition-all hover:bg-gray-50 disabled:opacity-50"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeletingId(card.id)}
                      className="p-2 text-neutral-gray/30 transition-all hover:text-red-600 disabled:opacity-50"
                      aria-label={`Delete card ending in ${card.last4}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray/40">
                      {card.cardType || "Card"}
                    </p>
                    <p className="text-xl font-black tracking-[0.2em] text-accent-navy">
                      •••• •••• •••• {card.last4}
                    </p>
                  </div>

                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray/40">
                        Expires
                      </p>
                      <p className="font-bold text-accent-navy">
                        {String(card.expiryMonth).padStart(2, "0")}/
                        {card.expiryYear}
                      </p>
                    </div>

                    <CreditCard
                      className="text-neutral-gray/10"
                      size={32}
                    />
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={() => setIsFundModalOpen(true)}
                className="group flex min-h-[240px] w-full flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-gray-200 p-8 transition-all hover:border-brand-primary hover:bg-brand-light/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-brand-primary group-hover:text-white">
                  <Plus size={24} />
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray group-hover:text-brand-primary">
                    Add Another Card
                  </p>
                  <p className="mt-2 max-w-[180px] text-[10px] font-medium text-neutral-gray/70">
                    Fund your wallet and select “Save this card”.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <h3 className="px-4 text-xl font-black uppercase italic tracking-tighter text-accent-navy">
              Security
            </h3>

            <div className="space-y-8 rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <ShieldCheck className="text-green-600" size={20} />
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-accent-navy">
                    Encrypted Storage
                  </h4>
                  <p className="mt-1 text-[10px] font-bold uppercase leading-relaxed text-neutral-gray/60">
                    Your full card details never touch our servers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Smartphone className="text-blue-600" size={20} />
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-accent-navy">
                    Payment Verification
                  </h4>
                  <p className="mt-1 text-[10px] font-bold uppercase leading-relaxed text-neutral-gray/60">
                    Payments may require mobile or bank verification.
                  </p>
                </div>
              </div>

              <hr className="border-gray-50" />

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                <p className="mb-2 text-[10px] font-black uppercase italic text-orange-800">
                  Billing Note
                </p>
                <p className="text-[9px] font-bold uppercase leading-relaxed text-orange-900/60">
                  Saved cards are available for future wallet funding.
                </p>
              </div>
            </div>
          </aside>

          <section className="col-span-1 mt-8 lg:col-span-3 sm:mt-12">
            <h3 className="mb-6 px-2 text-lg font-black uppercase italic text-accent-navy sm:text-xl">
              Transaction History
            </h3>

            <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm sm:rounded-[2rem]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                      <th className="px-6 py-4 sm:px-8">Date</th>
                      <th className="px-6 py-4 sm:px-8">Description</th>
                      <th className="px-6 py-4 sm:px-8">Amount</th>
                      <th className="px-6 py-4 text-right sm:px-8">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-10 text-center text-xs font-bold uppercase tracking-wider text-neutral-gray"
                        >
                          No wallet transactions yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => {
                        const isTopUp = transaction.type === "TOPUP";
                        const isSuccessful =
                          transaction.status.toLowerCase() === "success";

                        return (
                          <tr
                            key={transaction.id}
                            className="transition-colors hover:bg-gray-50/50"
                          >
                            <td className="px-6 py-4 text-xs font-bold text-neutral-gray sm:px-8">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-4 text-[11px] font-black uppercase italic text-accent-navy sm:px-8">
                              {transaction.description ?? "Wallet transaction"}
                            </td>

                            <td
                              className={`px-6 py-4 text-xs font-black sm:px-8 sm:text-sm ${
                                isTopUp
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatTransactionAmount(transaction)}
                            </td>

                            <td className="px-6 py-4 text-right sm:px-8">
                              <span
                                className={`rounded-md px-2 py-1 text-[9px] font-black uppercase ${
                                  isSuccessful
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}