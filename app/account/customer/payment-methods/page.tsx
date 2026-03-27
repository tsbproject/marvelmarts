import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import PaymentMethodsClient from "../_components/PaymentMethodsClient";
import { PaymentMethod, PaymentTypes } from "@prisma/client";

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

  


  const initialCards = PaymentTypes.map((card: { id: any; last4: any; expiryMonth: any; expiryYear: any; cardType: any; isDefault: any; }) => ({
  id: card.id,
  last4: card.last4,
  expiryMonth: Number(card.expiryMonth),
  expiryYear: Number(card.expiryYear),
  cardType: card.cardType,
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