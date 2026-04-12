import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  Store, 
  ShieldCheck, 
  Star, 
  Package, 
  CheckCircle2, 
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import ProductCard from "@/app/_components/ProductCard";
import { SerializedProduct } from "@/types/product";
import ShareActions from "./_components/ShareActions"; 
import ReportButton from "./_components/ReportButton";

export default async function PublicStorePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

// 1. Fetch Store + Products + Score + Verification Status + Suspension Status
const storeData = await prisma.vendorStore.findFirst({
  where: {
    OR: [
      { slug: slug },           // Try matching the slug 
      { id: slug },             // Try matching the VendorStore ID
      { vendorProfileId: slug } // Try matching the VendorProfile ID (the cmll... ID)
    ]
  },
  include: {
    vendorProfile: {
      include: {
        products: {
          where: { 
            isPublished: true,
            status: "ACTIVE" 
          },
          orderBy: { createdAt: "desc" },
          include: {
            category: { select: { name: true } },
            images: true,
            // Important: Include store inside vendorProfile for the ProductCard link!
            vendorProfile: {
               include: { store: true }
            }
          }
        },
        score: true 
      }
    }
  }
});

if (!storeData) {
  return notFound();
}

  if (!storeData || !storeData.vendorProfile) notFound();

  const vendor = storeData.vendorProfile;
  const displayStoreName = storeData.name || vendor.storeName || "Official Store";
  
  const baseUrl = "https://marvelmarts.vercel.app";
  const storeUrl = `${baseUrl}/store/${slug}`;
  const shareText = encodeURIComponent(`Check out ${displayStoreName} on MarvelMarts!`);

  // KILL SWITCH: If vendor is suspended or not approved
  if (vendor.isSuspended || vendor.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <Store size={48} className="text-gray-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-brand-primary rounded-full border-4 border-white flex items-center justify-center">
                <ShieldCheck size={16} className="text-accent-navy" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-accent-navy uppercase tracking-tighter mb-4">
            Store Temporarily <br /> Offline
          </h1>
          <p className="text-neutral-gray text-xl font-medium mb-8 leading-relaxed">
            {storeData.name} is currently updating their catalog or taking a short break. 
            Check back soon or explore other amazing merchants on MarvelMarts.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/shop" className="w-full py-4 bg-accent-navy text-white rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-brand-primary transition-colors">
              Explore Marketplace
            </a>
            <a href="/" className="w-full py-4 bg-gray-50 text-accent-navy rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-gray-100 transition-colors">
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // FIXED MAPPING: Included 'name' and 'isVerified' to satisfy SerializedProduct type
    const products: SerializedProduct[] = vendor.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    name: p.title, // Map title to name
    description: p.description || "",
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    categoryName: p.category?.name || "General",
    images: p.images.map(img => ({ url: img.url })),
    imageUrl: p.images[0]?.url || "/logo.png",
    stock: p.stock ?? 0,
    brand: p.brand || null,
    isPublished: p.isPublished,
    isTrending: p.isTrending || false,
    isVerified: vendor.isVerified, // Map vendor verification status to product
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    rating: p.rating || 0,
    reviewCount: p.ratingCount || 0,

    // FIX: Add the missing vendorProfileId required by your interface
    vendorProfileId: vendor.id || "", 

    vendorProfile: {
    storeName: vendor.storeName,
    isVerified: vendor.isVerified,
  }
  }));

  return (
    <div className="min-h-screen  bg-[#FBFBFB]">
      {/* STORE HERO */}
      <section className="relative h-[450px] md:h-[520px] bg-accent-navy  overflow-hidden">
        {vendor.coverUrl ? (
          <Image
            src={vendor.coverUrl}
            className="w-full h-full object-cover opacity-60"
            alt={`${displayStoreName} cover`}
            height={400}
            width={1400}
            
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 to-accent-navy" />
        )}
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12 flex flex-col md:flex-row items-center gap-8">
            {/* Logo */}
            <div className={`w-32 h-32 bg-white rounded-4xl p-2 shadow-2xl overflow-hidden border-4 ${vendor.isVerified ? 'border-brand-primary' : 'border-white'}`}>
             {vendor.logoUrl ? (
              <Image
                src={vendor.logoUrl}
                className="w-full h-full object-cover rounded-3xl"
                alt={`${displayStoreName} logo`}
                height={500}
                width={500}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Store size={48} className="text-brand-primary" />
              </div>
            )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  {displayStoreName}
                  {vendor.isVerified && (
                    <CheckCircle2 size={24} className="text-brand-primary fill-brand-primary/10" />
                  )}
                </h1>
                
                <div className="flex items-center gap-1 bg-brand-primary text-accent-navy px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  <ShieldCheck size={12} />
                  {vendor.score?.tier || "BRONZE"} MERCHANT
                </div>

                {vendor.isVerified && (
                   <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    <ShieldCheck size={12} className="text-brand-primary" />
                    Verified
                  </div>
                )}
              </div>
              
              <p className="text-brand-light font-medium opacity-90 max-w-xl mt-2 line-clamp-2">
               {vendor.bio || "Welcome to our MarvelMarts store!"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                <div className="flex items-center gap-3 pr-5 border-r border-white/10">
                  {vendor.whatsapp && (
                    <a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`} target="_blank" className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-green-500 transition-all group">
                      <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {vendor.instagram && (
                    <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-pink-600 transition-all group">
                      <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {vendor.facebook && (
                    <a href={`https://facebook.com/${vendor.facebook}`} target="_blank" className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-blue-600 transition-all group">
                      <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 pr-5 border-r border-white/10">
                  <a href={`https://wa.me/?text=${shareText}%20${storeUrl}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase transition-all">
                    <MessageCircle size={14} className="text-green-400" /> WhatsApp
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${storeUrl}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase transition-all">
                    <Twitter size={14} className="text-blue-400" /> Twitter
                  </a>
                  <ShareActions storeUrl={storeUrl} />
                </div>

                <div className="ml-4 md:ml-10">
                  <ReportButton 
                    vendorId={vendor.userId} 
                    storeName={displayStoreName} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORE STATS BAR */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-8 overflow-x-auto no-scrollbar">
          <StatItem icon={<Package size={16} />} label="Products" value={products.length} />
         <StatItem icon={<Star size={16} />} label="Reputation" value={`${vendor.qualityScore || 0}%`} />
          <StatItem icon={<ShieldCheck size={16} />} label="Joined" value={new Date(vendor.createdAt).getFullYear()} />
          <StatItem icon={<Store size={16} />} label="Status" value={vendor.isVerified ? "Verified" : "Standard"} />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight">Available Inventory</h2>
            <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest mt-1">Direct from {displayStoreName}</p>
          </div>
          <span className="text-xs font-bold text-neutral-gray uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl">{products.length} Items found</span>
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