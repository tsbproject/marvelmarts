import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { Store, ShieldCheck, Star, Package } from "lucide-react";
import ProductCard from "@/app/_components/ProductCard"; // Assuming you have this

export default async function PublicStorePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. Fetch Store + Products + Score in one go
  const storeData = await prisma.vendorStore.findUnique({
    where: { slug },
    include: {
      vendorProfile: {
        include: {
          products: {
            where: { isPublished: true }, // Phase 6: Only show live items
            orderBy: { createdAt: "desc" }
          },
          score: true // Phase 11: Display reputation
        }
      }
    }
  });

  if (!storeData) notFound();

  const vendor = storeData.vendorProfile;
  const products = vendor.products;

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* STORE HERO */}
      <section className="relative h-[300px] md:h-[400px] bg-accent-navy overflow-hidden">
        {storeData.banner ? (
          <img src={storeData.banner} className="w-full h-full object-cover opacity-60" alt="banner" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 to-accent-navy" />
        )}
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12 flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-white rounded-4xl p-2 shadow-2xl overflow-hidden border-4 border-white">
              {storeData.logo ? (
                <img src={storeData.logo} className="w-full h-full object-cover rounded-3xl" alt="logo" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Store size={48} className="text-brand-primary" /></div>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{storeData.name}</h1>
                <div className="flex items-center gap-1 bg-brand-primary text-accent-navy px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  <ShieldCheck size={12} />
                  {vendor.score?.tier || "BRONZE"} MERCHANT
                </div>
              </div>
              <p className="text-brand-light font-medium opacity-90 max-w-xl mt-2 line-clamp-2">
                {storeData.description || "Welcome to our MarvelMarts store!"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORE STATS BAR */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center gap-8 overflow-x-auto no-scrollbar">
          <StatItem icon={<Package size={16} />} label="Products" value={products.length} />
          <StatItem icon={<Star size={16} />} label="Rating" value={vendor.score?.score || "N/A"} />
          <StatItem icon={<ShieldCheck size={16} />} label="Joined" value={new Date(vendor.createdAt).getFullYear()} />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight">Available Inventory</h2>
          <span className="text-xs font-bold text-neutral-gray uppercase tracking-widest">{products.length} Items found</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-4xl border-2 border-dashed border-gray-100">
            <Package className="mx-auto text-gray-200 mb-4" size={64} />
            <h3 className="text-xl font-black text-accent-navy">No products yet!</h3>
            <p className="text-neutral-gray font-medium">This merchant is currently updating their catalog.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="text-brand-primary">{icon}</div>
      <span className="text-xs font-black text-accent-navy uppercase tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">{label}</span>
    </div>
  );
}