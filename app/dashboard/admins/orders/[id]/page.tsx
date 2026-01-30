import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailView from "./OrderDetailView";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      items: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="p-6 md:p-10 bg-gray-50/30 min-h-screen">
      <OrderDetailView order={JSON.parse(JSON.stringify(order))} />
    </div>
  );
}