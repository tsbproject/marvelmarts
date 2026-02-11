// app/(storefront)/page.tsx
import prisma from "@/app/lib/prisma";
import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/EcommerceCarousel';
import FlashSales from './_components/FlashSales';
import NewArrival from './_components/NewArrival';
import FeaturedProducts from './_components/FeaturedProducts';
import StoreHydrator from './_components/StoreHydrator';
import FeaturedCategoriesHome from './_components/home/FeaturedCategoriesHome';
import TrendingCarousel from './_components/home/TrendingCarousel';

// Force Next.js to fetch fresh data from Prisma on every request
export const revalidate = 0;

export default async function HomePage() {
  // 1. Fetch all tactical data in parallel
  const [flashRaw, newRaw, featuredRaw, trendingRaw, featuredCatsRaw] = await Promise.all([
    // FLASH SALES
    prisma.product.findMany({
      where: { status: "ACTIVE", isFlashSale: true },
      include: { images: true, category: true },
      take: 6,
      orderBy: { updatedAt: 'desc' }
    }),
    
    // NEW ARRIVALS
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
    
    // FEATURED PRODUCTS
    prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: { images: true, category: true },
      take: 12,
      orderBy: { updatedAt: 'desc' }
    }),

    // TRENDING PRODUCTS
    prisma.product.findMany({
      where: { status: "ACTIVE", isTrending: true },
      include: { images: true, category: true },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    }),

    // FEATURED CATEGORIES
    prisma.category.findMany({
      where: { isFeatured: true },
      orderBy: { position: 'asc' },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: { select: { products: true } }
      }
    })
  ]);

  // 2. Product Serialization Logic
  const serializeProducts = (items: any[]): SerializedProduct[] => {
    return items.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.name || item.title || "Untitled Gear",
      description: item.description || "",
      price: Number(item.price),
      discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
      categoryName: item.category?.name || "General",
      stock: item.stock || 0,
      imageUrl: item.images?.[0]?.url || "https://placehold.co/600x400?text=No+Image",
      images: item.images?.map((img: any) => ({ url: img.url })) || [],
      isTrending: !!item.isTrending,
      isPublished: item.isPublished ?? true, 
    }));
  };

  // 3. Category Serialization Logic
  const featuredCats = featuredCatsRaw.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    imageUrl: cat.imageUrl && cat.imageUrl.length > 0 
      ? cat.imageUrl 
      : `https://placehold.co/600x400?text=${encodeURIComponent(cat.name)}`,
    _count: {
      products: cat._count.products
    }
  }));

  // 4. Prepare Serialized Arrays
  const flashProducts = serializeProducts(flashRaw);
  const newArrivalProducts = serializeProducts(newRaw);
  const featuredProducts = serializeProducts(featuredRaw);
  const trendingProducts = serializeProducts(trendingRaw);
  
  // Combine all for Redux Hydration
  const serializedAll = [...flashProducts, ...newArrivalProducts, ...featuredProducts, ...trendingProducts];
  
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* MarvelMarts Redux Bridge */}
      <StoreHydrator products={serializedAll} />

      <div className="relative top-0 md:-top-4">
        <EcommerceCarousel />
      </div>
      
      <div className="max-w-[1400px] mx-auto space-y-24 px-4 md:px-10 pb-20">
        
        {/* Item A: Flash Sales */}
        {flashProducts.length > 0 && (
          <section>
            <FlashSales 
              products={flashProducts} 
              endTime={flashSaleEndTime.toISOString()} 
            />
          </section>
        )}

        {/* Item B: Featured Categories */}
        {featuredCats.length > 0 && (
          <section>
            <FeaturedCategoriesHome categories={featuredCats} />
          </section>
        )}

        {/* Item C: Trending Carousel */}
        {trendingProducts.length > 0 && (
          <section>
            <TrendingCarousel initialData={trendingProducts} />
          </section>
        )}

        {/* Item D: Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <section>
            <FeaturedProducts products={featuredProducts} />
          </section>
        )}

        {/* Item E: New Arrivals */}
        {newArrivalProducts.length > 0 && (
          <section>
            <NewArrival products={newArrivalProducts} />
          </section>
        )}

      </div>
    </div>
  );
}
