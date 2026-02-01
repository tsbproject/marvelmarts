





import prisma from "@/app/lib/prisma";
import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/EcommerceCarousel';
import FlashSales from './_components/FlashSales';
import NewArrival from './_components/NewArrival';
import FeaturedProducts from './_components/FeaturedProducts';
import StoreHydrator from './_components/StoreHydrator';

export default async function HomePage() {
  // 1. Fetch data from Prisma
  const [flashRaw, newRaw, featuredRaw] = await Promise.all([
    // FLASH SALES: Fetching 6 to fill the flex row
    prisma.product.findMany({
      where: { status: "ACTIVE", isFlashSale: true },
      include: { images: true, category: true },
      take: 6,
      orderBy: { updatedAt: 'desc' }
    }),
    
    // NEW ARRIVALS: Fetching 8 (standard grid)
    prisma.product.findMany({
      where: { 
        status: "ACTIVE",
        OR: [
          { isNewArrival: true },
          { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      },
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    
    // FEATURED: Fetching 12 (multiple rows)
    prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: { images: true, category: true },
      take: 12,
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  // 2. Centralized Serialization Function
  const serialize = (items: any[]): SerializedProduct[] => {
    return (items || []).map(item => {
      const primaryImage = item.images?.[0]?.url || 
        `https://placehold.co/600x400?text=${encodeURIComponent(item.title)}`;

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description || "",
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
        categoryName: item.category?.name || "General",
        stock: item.stock || 0,
        imageUrl: primaryImage,
        images: item.images?.map((img: any) => ({ url: img.url })) || [],
      };
    });
  };

  // 3. Prepare serialized lists
  const flashProducts = serialize(flashRaw);
  const newArrivalProducts = serialize(newRaw);
  const featuredProducts = serialize(featuredRaw);
  
  // Master list for Redux Hydration
  const serializedAll = [...flashProducts, ...newArrivalProducts, ...featuredProducts];

  // Set Flash Sale Timer
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hydrate Redux Store once with all data */}
      <StoreHydrator products={serializedAll} />

      <div className="relative top-0 md:-top-4">
        <EcommerceCarousel />
      </div>
      
      <div className="max-w-[1400px] mx-auto space-y-24 px-4 md:px-10 pb-20">
        
        {/* Flash Sales Row (Now receives 6 products) */}
        {flashProducts.length > 0 && (
          <section>
            <FlashSales 
              products={flashProducts} 
              endTime={flashSaleEndTime.toISOString()} 
            />
          </section>
        )}

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <section>
            <FeaturedProducts products={featuredProducts} />
          </section>
        )}

        {/* New Arrivals Section */}
        {newArrivalProducts.length > 0 && (
          <section>
            <NewArrival products={newArrivalProducts} />
          </section>
        )}

      </div>
    </div>
  );
}