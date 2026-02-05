// app/dashboard/admins/trending/page.tsx
import prisma from "@/app/lib/prisma";
import TrendingClient from "./TrendingClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function TrendingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/sign-in");

  // Fetch products, sorting trending ones to the top
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
      isTrending: true,
      price: true,
    },
    orderBy: [
      { isTrending: 'desc' },
      { name: 'asc' }
    ]
  });

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
            Market <span className="text-orange-500">Intelligence</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
            Curate Trending Gear for MarvelMarts Homepage
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase text-orange-700">Live Traffic Sync</span>
        </div>
      </header>

      <TrendingClient products={products} />
    </div>
  );
}