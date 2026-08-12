import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import PaymentMethodsClient from "../_components/PaymentMethodsClient";
import { CustomerService } from "@/app/lib/services/customer.service";

export const dynamic = "force-dynamic";

type CardItem = {
  id: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
};

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

      const {
          cards: rawCards,
          wallet: walletData,
        } = await CustomerService.getPaymentMethodsData(
          session.user.id
        );

  const initialCards: CardItem[] = rawCards.map((card) => ({
    id: card.id,
    last4: card.last4 ?? "",
    expiryMonth: Number(card.expiryMonth),
    expiryYear: Number(card.expiryYear),
    cardType: card.cardType ?? "",
    isDefault: card.isDefault,
  }));

  const safeTransactions =
    walletData?.transactions.map((tx) => ({
      id: tx.id,
      walletId: tx.walletId,
      amount: Number(tx.amount),
      type: tx.type,
      status: tx.status,
      reference: tx.reference,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    })) || [];

  return (
    <PaymentMethodsClient
      initialCards={initialCards}
      walletBalance={walletData?.balance ? Number(walletData.balance) : 0}
      transactions={safeTransactions}
    />
  );
}