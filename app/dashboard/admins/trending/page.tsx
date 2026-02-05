// // app/dashboard/admins/trending/page.tsx
// import prisma from "@/app/lib/prisma";
// import TrendingClient from "./TrendingClient";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { redirect } from "next/navigation";

// export default async function TrendingPage() {
//   const session = await getServerSession(authOptions);
//   if (!session) redirect("/auth/sign-in");

//   // Fetch products, sorting trending ones to the top
//   const products = await prisma.product.findMany({
//   where: {
//     status: "ACTIVE", 
//   },
//   select: {
//     id: true,
//     title: true, // 👈 Changed from name to title
//     sku: true,
//     isTrending: true,
//     price: true,
//     images: {
//       take: 1,
//       select: {
//         url: true
//       }
//     }
//   },
//   orderBy: {
//     title: 'asc', // 👈 Changed from name to title
//   },
// });

//   return (
//     <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
//       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
//         <div>
//           <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
//             Market <span className="text-orange-500">Intelligence</span>
//           </h1>
//           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
//             Curate Trending Gear for MarvelMarts Homepage
//           </p>
//         </div>
        
//         <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
//           <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
//           <span className="text-[10px] font-black uppercase text-orange-700">Live Traffic Sync</span>
//         </div>
//       </header>

//       <TrendingClient products={products} />
//     </div>
//   );
// }




import prisma from "@/app/lib/prisma";
import TrendingClient from "./TrendingClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function TrendingPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/sign-in");

  // 1. Tactical Params Extraction
  const params = await searchParams;
  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const pageSize = 10; // Items per page
  const skip = (currentPage - 1) * pageSize;

  // 2. Parallel Data Fetching (Products + Total Count)
  const [rawProducts, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        sku: true,
        isTrending: true,
        price: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
      orderBy: [
        { isTrending: "desc" }, // Trending items first for easier management
        { title: "asc" },
      ],
      skip: skip,
      take: pageSize,
    }),
    prisma.product.count({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  // 3. Serialization (Decimal to Number & Flatten Images)
  const products = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    sku: p.sku,
    isTrending: p.isTrending,
    price: Number(p.price), // Fixes the Decimal Object Error
    imageUrl: p.images?.[0]?.url || null,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

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
          <span className="text-[10px] font-black uppercase text-orange-700">
            {totalCount} Units Analyzed
          </span>
        </div>
      </header>

      {/* Pass data + pagination metadata to the client component */}
      <TrendingClient 
        products={products} 
        totalPages={totalPages} 
        currentPage={currentPage} 
      />
    </div>
  );
}