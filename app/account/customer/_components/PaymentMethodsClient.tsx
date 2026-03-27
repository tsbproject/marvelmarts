"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deletePaymentMethod,
  setDefaultPaymentMethod,
  } from "@/app/_actions/payment";
  import { processWalletPurchase, topUpWallet } from "@/app/_actions/wallet";
import { useNotification } from "@/app/_context/NotificationContext";
import {
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  Smartphone,
  Lock,
  MoreVertical,
  AlertCircle,
  Loader2,
  X,
  Check, 
  Wallet,
} from "lucide-react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Script from "next/script";

interface Transaction {
  id: string;
  amount: any;
  type: string;
  status: string;
  description: string | null;
  createdAt: Date;
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

interface Props {
  initialCards: any[];
  walletBalance: number;
  // transactions: Transaction[]; 
  transactions: WalletTransaction[];
}

interface PaymentMethod {
  id: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
}





interface PaymentMethodsClientProps {
  initialCards: PaymentMethod[];
  walletBalance: number;

}

type PurchaseResponse = 
  | { success: true; newBalance: string } 
  | { success: false; error: string };
  

export default function PaymentMethodsClient({
  initialCards, walletBalance, transactions
}: PaymentMethodsClientProps) {
  
  
  
  const router = useRouter();
  const { data: session } = useSession();
  const { notifyError, notifySuccess } = useNotification();

  const [cards, setCards] = useState<PaymentMethod[]>(initialCards ?? []);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const handleAddNewCard = () => {
  // 1. Check for Paystack script availability
  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop) {
    notifyError("Payment gateway is still loading.");
    return;
  }

  // 2. Validate Public Key (Reduces 400 errors)
  const pk = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!pk || !pk.startsWith('pk_')) {
    console.error("Invalid Paystack Public Key:", pk);
    notifyError("Configuration error: Invalid Public Key.");
    return;
  }

  setIsInitializing(true);

  // 3. Define the success handler separately
  const handleSuccess = async (response: any) => {
    try {
      // Use the Server Action directly or your fetch call
      const result = await savePaymentMethod({
        provider: 'PAYSTACK',
        providerId: response.reference,
        last4: "",
        expiryMonth: "",
        expiryYear: "",
        cardType: ""
      });

      if (result.success) {
        notifySuccess("Card secured successfully!");
        router.refresh();
      } else {
        notifyError(result.error || "Failed to save card");
      }
    } catch (error) {
      notifyError("Verification failed.");
    } finally {
      setIsInitializing(false);
    }
  };

  try {
    // 4. Initialize Paystack
    const handler = PaystackPop.setup({
      key: pk,
      email: session?.user?.email,
      amount: 5000, // 50 Naira in Kobo
      currency: "NGN",
      // IMPORTANT: Wrap the async function in a standard sync arrow function
      callback: (res: any) => {
        handleSuccess(res);
      },
      onClose: () => {
        setIsInitializing(false);
      },
    });

    handler.openIframe();
  } catch (error) {
    setIsInitializing(false);
    console.error("Paystack Setup Error:", error);
    notifyError("Could not open payment window.");
  }
};


const handleWalletPayment = async (orderId: string, total: number) => {
  // Check if walletBalance (from props) is enough
  if (walletBalance < total) {
    notifyError("Insufficient funds. Please top up your wallet.");
    return;
  }

      setIsProcessing(true);
      
      try {
        // 2. Pass the arguments correctly
        const result: PurchaseResponse = await processWalletPurchase(orderId, total);

        if (result.success) {
          notifySuccess("Payment successful! Redirecting to orders...");
          router.push("/account/customer/orders");
        } else {
          // 3. result.error is now safe because of the Type Union above
          notifyError(result.error);
        }
      } catch (err) {
        notifyError("An unexpected error occurred during payment.");
      } finally {
        setIsProcessing(false);
      }
    };



const handleSetDefault = async (methodId: string) => {
    setIsPending(true);

    try {
      const result = await setDefaultPaymentMethod(methodId);

      if (result.success) {
        notifySuccess("Primary payment method updated.");

        setCards((prev) =>
          prev.map((card) => ({
            ...card,
            isDefault: card.id === methodId,
          }))
        );

        router.refresh();
      } else {
        notifyError(result.error || "Failed to update default payment method.");
      }
    } catch (error) {
      notifyError("Something went wrong while updating your card.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    setIsPending(true);

    try {
      const result = await deletePaymentMethod(cardId);

      if (result.success) {
        notifySuccess("Payment method removed.");
        setCards((prev) => prev.filter((card) => card.id !== cardId));
        setDeletingId(null);
      } else {
        notifyError(result.error || "Failed to delete card.");
      }
    } catch (error) {
      notifyError("Something went wrong while deleting the card.");
    } finally {
      setIsPending(false);
    }
  };


    const handleTopUp = (amount: number) => {
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        notifyError("Payment system is still loading...");
        return;
      }

      const pk = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!pk || !pk.startsWith("pk_")) {
        console.error("Invalid Paystack Public Key:", pk);
        notifyError("Configuration error: Invalid Public Key.");
        return;
      }

      const userEmail = session?.user?.email;
      if (!userEmail) {
        notifyError("Please sign in to top up your wallet.");
        return;
      }

      const handleTopUpSuccess = async (response: any) => {
        try {
          const result = await topUpWallet(response.reference);

          if ("success" in result && result.success) {
            notifySuccess(`₦${amount.toLocaleString()} added to your wallet!`);
            router.refresh();
          } else {
            notifyError((result as any).error || "Verification failed");
          }
        } catch (err) {
          console.error("Wallet top-up error:", err);
          notifyError("A network error occurred.");
        }
      };

      try {
        const handler = PaystackPop.setup({
          key: pk,
          email: userEmail,
          amount: Math.floor(amount * 100),
          currency: "NGN",
          callback: (response: any) => {
            handleTopUpSuccess(response);
          },
          onClose: () => {},
        });

        handler.openIframe();
      } catch (error) {
        console.error("Paystack Setup Error:", error);
        notifyError("Could not open payment window.");
      }
    };
  
const savedCards = [
    { id: '1', last4: '4242', expiry: '12/26', brand: 'Visa', isDefault: true },
    { id: '2', last4: '8812', expiry: '05/25', brand: 'Mastercard', isDefault: false },
  ];

 return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <DashboardHeader title="Payment Methods" showLogout={true} />

      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        onLoad={() => console.log("Paystack Script Loaded")}
        onError={(e) => console.error("Paystack Script Load Error", e)}
      />

      <div className="p-4 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* --- Secure Header Hero --- */}
        <section className="relative overflow-hidden bg-accent-navy rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 text-white shadow-2xl">
          <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Lock size={12} className="text-brand-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light">PCI-DSS Compliant</span>
              </div>
              <h2 className="text-md md:text-4xl font-black uppercase italic tracking-tighter leading-none">
                Wallet &nbsp;  & &nbsp; <span className="text-brand-primary">Billing</span>
              </h2>
              <p className="text-blue-100/70 text-sm md:text-lg font-medium max-w-sm uppercase tracking-tight">
                Securely manage your saved cards and payment preferences.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <button 
                type="button" // keep it type="button" so it doesn't trigger a page reload
                onClick={handleAddNewCard}
                disabled={isInitializing}
                className="group relative p-4 text-sm  rounded-2xl  font-bold flex items-center gap-4 bg-brand-primary ..."
              >
                {isInitializing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                <span className="relative z-10">{isInitializing ? "Opening..." : "Add New Card"}</span>
                {/* <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0  transition-transform duration-300" /> */}
              </button>
            </form>
          
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full -mr-32 -mt-32" />
        </section>

        {/* Wallet Balance Card */}
        <div className="relative overflow-hidden bg-brand-primary rounded-[2.5rem] p-8 text-white min-h-[240px] flex flex-col justify-between shadow-xl">
          {/* Decorative Background Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Marvel Wallet</p>
              <h3 className="text-3xl font-bold mt-2">
                ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-xl">
              <Wallet size={24} />
            </div>
          </div>

          <div className="relative z-10">
            <button 
              onClick={() => handleTopUp(5000)} // Example: Quick top-up of 5k
              className="w-full bg-white text-brand-primary font-black py-3 rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>Top Up Wallet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Saved Cards List --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-accent-navy uppercase italic tracking-tighter">Saved Cards</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-gray/50">
                {cards.length} {cards.length === 1 ? 'Card' : 'Cards'} Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card: PaymentMethod) => (
                      <div 
                        key={card.id} 
                        className={`relative overflow-hidden py-4 px-8 rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:shadow-xl ${
                        card.isDefault ? 'bg-white border-brand-primary/30 ring-1 ring-brand-primary/10' : 'bg-white border-gray-100'
                        }`}
                      >
                        {/* --- Confirmation Overlay --- */}
                        {deletingId === card.id && (
                        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                          <AlertCircle className="text-red-500 mb-2" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-accent-navy mb-4">
                          Remove this card?
                          </p>
                          <div className="flex gap-3">
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="p-3 bg-gray-100 rounded-2xl text-neutral-gray hover:bg-gray-200 transition-all"
                            disabled={isPending}
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(card.id)}
                            className="p-3 bg-red-600 rounded-2xl text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            disabled={isPending}
                          >
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                          </button>
                          </div>
                        </div>
                        )}

                        <div className="flex justify-between items-start mb-12">
                        <div className="w-12 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 font-black text-[10px] text-accent-navy uppercase italic">
                          {card.isDefault ? (
                              <span className="bg-brand-primary text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md h-fit">
                                Primary
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSetDefault(card.id)}
                                className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border border-gray-200 text-neutral-gray hover:bg-gray-50 transition-all"
                              >
                                Set as Default
                              </button>
                            )}
                          
                          <button 
                          onClick={() => setDeletingId(card.id)}
                          className="p-2 text-neutral-gray/30 hover:text-red-600 transition-all"
                          >
                          <Trash2 size={16} />
                          </button>
                        </div>
                        </div>

                        <div className="space-y-1">
                        <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest opacity-40">Card Number</p>
                        <p className="text-accent-navy text-xl font-black tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                        </div>

                        <div className="mt-8 flex justify-between items-end">
                        <div>
                          <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest opacity-40">Expires</p>
                          <p className="text-accent-navy font-bold">{card.expiryMonth}/{card.expiryYear}</p>
                        </div>
                        <CreditCard className="text-neutral-gray/10" size={32} />
                        </div>
                      </div>
                      ))}

              {/* Add New Placeholder */}
                <form onSubmit={(e) => e.preventDefault()}>
                  <button 
                    type="button" // Prevents the form from submitting/reloading the page
                    onClick={handleAddNewCard}
                    disabled={isInitializing}
                    className="w-full group border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-brand-primary hover:bg-brand-light/20 transition-all min-h-[240px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                      {isInitializing ? (
                        <Loader2 size={24} className="animate-spin text-brand-primary group-hover:text-white" />
                      ) : (
                        <Plus size={24} />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-gray group-hover:text-brand-primary">
                      {isInitializing ? "Opening Gateway..." : "Add Method"}
                    </span>
                  </button>
                </form>
              
            </div>
          </div>

          

          {/* --- Billing Security Sidebar --- */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-accent-navy uppercase italic tracking-tighter px-4">Security</h3>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-accent-navy tracking-widest">Encrypted Storage</h4>
                  <p className="text-[10px] font-bold text-neutral-gray/60 leading-relaxed mt-1 uppercase">Your full card details never touch our servers.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-accent-navy tracking-widest">2FA Protection</h4>
                  <p className="text-[10px] font-bold text-neutral-gray/60 leading-relaxed mt-1 uppercase">Payments may require mobile verification.</p>
                </div>
              </div>

              <hr className="border-gray-50" />

              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <p className="text-[10px] font-black text-orange-800 uppercase italic mb-2">Billing Note</p>
                <p className="text-[9px] font-bold text-orange-900/60 leading-relaxed uppercase">
                  Default methods are used for one-click checkouts and subscription renewals.
                </p>
              </div>

              
            </div>
            
          </div>
          
          
          {/* Transaction History Section */}
          <div className="mt-8 sm:mt-12 col-span-1 lg:col-span-3">
            <h3 className="text-lg sm:text-xl font-black text-accent-navy uppercase italic px-2 mb-6">Transaction History</h3>
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 text-[9px] xxs:text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                      <th className="px-6 sm:px-8 py-4">Date</th>
                      <th className="px-6 sm:px-8 py-4">Description</th>
                      <th className="px-6 sm:px-8 py-4">Amount</th>
                      <th className="px-6 sm:px-8 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 sm:px-8 py-4 text-xs font-bold text-neutral-gray">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 sm:px-8 py-4 font-black text-[11px] uppercase italic text-accent-navy">
                          {tx.description}
                        </td>
                        <td className={`px-6 sm:px-8 py-4 font-black text-xs sm:text-sm ${tx.type === 'TOPUP' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'TOPUP' ? '+' : '-'} ₦{Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-6 sm:px-8 py-4 text-right">
                          <span className="bg-green-100 text-green-700 text-[8px] xxs:text-[9px] font-black uppercase px-2 py-1 rounded-md">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





async function savePaymentMethod(data: {
  provider: string;
  providerId: string; // This is the reference from Paystack
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
}) {
  try {
    // 1. Rename 'response' to 'res' to avoid initialization conflict
    const res = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 2. Use 'data.providerId' (which contains the reference)
      body: JSON.stringify({ reference: data.providerId }), 
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || 'Failed to save card' };
    }

    const result = await res.json();
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Save Method Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}




