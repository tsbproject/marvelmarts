import { prisma } from "@/app/lib/prisma";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersManagementPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">
            Order <span className="text-blue-600">Fulfillment</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            MarvelMarts Logistics & Revenue
          </p>
        </div>

        <OrdersTable initialOrders={JSON.parse(JSON.stringify(orders))} />
      </div>
    </div>
  );
}