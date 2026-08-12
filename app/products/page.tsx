// app/shop/page.tsx
import ShopSidebar from "@/app/_components/ShopSidebar";
import ShopContent from "@/app/shop/components/Shopcontent"; 
import { SerializedProduct } from "@/types/product"; 
import { ProductService } from "@/app/lib/services/product.service";
import { CategoryService } from "@/app/lib/services/category.service";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    subcategory?: string; 
    brand?: string; 
    minPrice?: string; 
    maxPrice?: string 
  }>;
}) {


 /* -------------------------------------------------------------------------- */
/*                            FETCH CATEGORIES                                */
/* -------------------------------------------------------------------------- */



  // 2. Build the query
  const filters = await searchParams;

    const categories =
      await CategoryService.getRootCategories();

  /* -------------------------------------------------------------------------- */
/*                              FETCH PRODUCTS                                */
/* -------------------------------------------------------------------------- */

const rawProducts =
  await ProductService.getShopProducts(
    filters
  );

  // 3. SINGLE SOURCE OF TRUTH: Map raw DB data to SerializedProduct interface
  const serializedProducts: SerializedProduct[] = rawProducts.map((p: any) => ({
    // ID, title, slug, and other basic strings
    id: p.id,
    title: p.title,
    name: p.title || "",
    slug: p.slug,
    description: p.description || "",
    stock: p.stock || 0,
    isPublished: p.isPublished ?? true,
    isVerified: !!p.isVerified,
   
    
    
    // Numeric conversions for Decimals
    price: Number(p.price || 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    
    // UI-specific flattened fields
    categoryName: p.category?.name || "Tactical Gear",
    imageUrl: p.images?.[0]?.url || "/logo.png",
    
    // Array properties
    images: p.images && p.images.length > 0 ? p.images : [{ url: "/logo.png" }],
    variants: p.variants ? p.variants.map((v: any) => ({
      ...v,
      price: Number(v.price),
      
    })) : [],

    // Date to String serialization
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString(),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date(p.updatedAt).toISOString(),
    
    // Additional optional fields
    brand: p.brand || null,
    vendorProfileId: p.vendorProfileId || null,
  }));

  return (
    <div className="bg-neutral-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-accent-navy py-16 px-4">
        <div className="container mx-auto">
          <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
            Elite Equipment Selection
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
            The <span className="text-brand-primary">Armory</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        <ShopSidebar categories={categories} />
        {/* Pass the fully serialized array to the Client component */}
        <ShopContent initialProducts={serializedProducts} />
      </div>
    </div>
  );
}