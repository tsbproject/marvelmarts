import { prisma } from "@/app/lib/prisma";
import RefundQueueTable from "@/app/_components/admins/RefundQueueTable";
import { ShieldCheck, History } from "lucide-react";

export default async function RefundQueuePage() {
  const rawPendingRefunds = await prisma.order.findMany({
    where: {
      refundStatus: {
        in: ["requested", "pending"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Decimal objects to Numbers so Client Components can read them
  const pendingRefunds = rawPendingRefunds.map(order => ({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    // Also sanitize dates to strings if you hit "Date object" serialization errors
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-[1600px] mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-3">
            <ShieldCheck className="text-navy" size={36} /> 
            Refund <span className="text-orange-500">Operations</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Command Center / Financial Reversals
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          {/* Now passing plain objects - No more Decimal error */}
          <RefundQueueTable requests={pendingRefunds} />
        </section>
      </div>
    </div>
  );
}