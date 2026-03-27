import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import PaymentMethodsClient from "../_components/PaymentMethodsClient";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [rawCards, walletData] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
  ]);

  


  const initialCards = rawCards.map((card) => ({
    id: card.id,
    last4: card.last4,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    cardType: card.cardType || "Card",
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