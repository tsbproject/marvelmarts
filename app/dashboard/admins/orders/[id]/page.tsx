import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailView from "./OrderDetailView";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      items: true,
    },
  });

  if (!order) notFound();

  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50/30 min-h-screen">
      <OrderDetailView order={serializedOrder} />
    </div>
  );
}