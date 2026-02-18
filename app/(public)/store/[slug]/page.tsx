import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { Store, ShieldCheck, Star, Package, CheckCircle2 } from "lucide-react";
import ProductCard from "@/app/_components/ProductCard";
import { SerializedProduct } from "@/types/product";

export default async function PublicStorePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // 1. Fetch Store + Products + Score + Verification Status
  const storeData = await prisma.vendorStore.findUnique({
    where: { slug },
    include: {
      vendorProfile: {
        include: {
          products: {
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            include: {
              category: { select: { name: true } },
              images: true,
            }
          },
          score: true 
        }
      }
    }
  });

  if (!storeData) notFound();

  const vendor = storeData.vendorProfile;

  // 2. Map raw Prisma products to SerializedProduct type precisely
  const products: SerializedProduct[] = vendor.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description || "",
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    categoryName: p.category?.name || "General",
    images: p.images.map(img => ({ url: img.url })),
    imageUrl: p.images[0]?.url || "/placeholder.png",
    stock: p.stock ?? 0,
    brand: p.brand || null,
    isPublished: p.isPublished,
    isTrending: p.isTrending || false,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    rating: p.rating || 0,
    reviewCount: p.ratingCount || 0, // Using the correct field from your schema
  }));

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
            {/* Logo with Verification Ring */}
            <div className={`w-32 h-32 bg-white rounded-4xl p-2 shadow-2xl overflow-hidden border-4 ${vendor.isVerified ? 'border-brand-primary' : 'border-white'}`}>
              {storeData.logo ? (
                <img src={storeData.logo} className="w-full h-full object-cover rounded-3xl" alt="logo" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Store size={48} className="text-brand-primary" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  {storeData.name}
                  {vendor.isVerified && (
                    <CheckCircle2 size={24} className="text-brand-primary fill-brand-primary/10" />
                  )}
                </h1>
                
                {/* Dynamic Tier Badge (Phase 11) */}
                <div className="flex items-center gap-1 bg-brand-primary text-accent-navy px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  <ShieldCheck size={12} />
                  {vendor.score?.tier || "BRONZE"} MERCHANT
                </div>

                {/* Verification Badge (Phase 7) */}
                {vendor.isVerified && (
                   <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    <ShieldCheck size={12} className="text-brand-primary" />
                    Verified
                  </div>
                )}
              </div>
              
              <p className="text-brand-light font-medium opacity-90 max-w-xl mt-2 line-clamp-2">
                {storeData.description || "Welcome to our MarvelMarts store!"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORE STATS BAR */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-8 overflow-x-auto no-scrollbar">
          <StatItem icon={<Package size={16} />} label="Products" value={products.length} />
          <StatItem icon={<Star size={16} />} label="Reputation" value={`${vendor.score?.score || 0}%`} />
          <StatItem icon={<ShieldCheck size={16} />} label="Joined" value={new Date(vendor.createdAt).getFullYear()} />
          <StatItem icon={<Store size={16} />} label="Status" value={vendor.isVerified ? "Verified" : "Standard"} />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight">Available Inventory</h2>
            <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest mt-1">Direct from {storeData.name}</p>
          </div>
          <span className="text-xs font-bold text-neutral-gray uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">{products.length} Items found</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-4xl border-2 border-dashed border-gray-100">
            <Package className="mx-auto text-gray-200 mb-4" size={64} />
            <h3 className="text-xl font-black text-accent-navy uppercase">Catalog Empty</h3>
            <p className="text-neutral-gray font-medium">This merchant hasn&apos;t published any products yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="flex items-center gap-2 shrink-0 border-r border-gray-100 pr-8 last:border-0">
      <div className="text-brand-primary">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs font-black text-accent-navy uppercase tracking-tighter leading-none">{value}</span>
        <span className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
}