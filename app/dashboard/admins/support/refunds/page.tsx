import { prisma } from "@/app/lib/prisma";
import RefundQueueTable from "@/app/_components/admins/RefundQueueTable";
import { ShieldCheck, Landmark } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RefundQueuePage() {
  const rawPendingRefunds = await prisma.order.findMany({
    where: {
      refundStatus: { in: ["requested", "pending"] },
    },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: {
      createdAt: "desc", // Changed from updatedAt to createdAt
    },
  });

  // Calculate total exposure
  const totalPendingVolume = rawPendingRefunds.reduce((acc, order) => acc + Number(order.total), 0);

  const pendingRefunds = rawPendingRefunds.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    // REMOVE order.updatedAt.toISOString() if it doesn't exist in your schema
    // updatedAt: order.updatedAt.toISOString(), 
  items: order.items.map(item => ({
  ...item,
  unitPrice: Number(item.unitPrice),
}))
  }));

  return (
    <div className="max-w-[1600px] mx-auto py-10 px-4 min-h-screen bg-gray-50/20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-3">
            <ShieldCheck className="text-[#002B5B]" size={36} /> 
            Refund <span className="text-[#F7931E]">Operations</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
               Command Center / Financial Reversals
             </p>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Pending Volume</p>
            <p className="text-xl font-black text-[#002B5B]">₦{totalPendingVolume.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          {/* This table now handles the Reject/Approve logic internally */}
          <RefundQueueTable 
             key={pendingRefunds.length} 
             requests={pendingRefunds} 
          />
        </section>
      </div>
    </div>
  );
}