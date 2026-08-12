import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


import { CategoryService } from "@/app/lib/services/category.service";



// Next.js 15: Params MUST be a Promise
type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CategoryPage({ params }: PageProps) {
  // 1. Await the params (Required in Next.js 15)
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;

  if (!slugArray || slugArray.length === 0) notFound();

  // 2. Join the slug array into a path string (e.g., "tactical/gear")
  const slugPath = slugArray.join("/");

/* -------------------------------------------------------------------------- */
/*                         FETCH PUBLIC CATEGORY                              */
/* -------------------------------------------------------------------------- */

const category =
  await CategoryService.getPublicCategoryBySlug(
    slugPath
  );
  
  // 3. Debugging: If this triggers, your DB doesn't have a record matching slugPath
  if (!category) {
    console.error(`Dev Error: No category found in database for slug: "${slugPath}"`);
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-gray mb-6">
        <Link href="/" className="hover:text-brand-primary">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-primary">Shop</Link>
        <span>/</span>
        <span className="text-accent-navy">{category.name}</span>
      </nav>

      <header className="mb-12">
        <h1 className="text-xl md:text-3xl font-black italic uppercase text-accent-navy tracking-tighter leading-none">
          {category.name.split(' ')[0]} <span className="text-brand-primary">{category.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-neutral-gray mt-4 max-w-2xl font-medium">
          Explore our professional grade collection of {category.name.toLowerCase()}. Engineered for performance and durability.
        </p>
      </header>

      {/* Subcategories Section */}
      {category.children.length > 0 && (
        <section className="mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-primary mb-6">Sub-Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`} // MUST MATCH FOLDER PATH
                className="group p-6 bg-white border border-neutral-light rounded-[2rem] hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5 transition-all"
              >
                <span className="block text-center text-sm font-black uppercase italic text-accent-navy group-hover:text-brand-primary transition-colors">
                  {child.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-neutral-light pb-4">
          <h2 className="text-xl font-black uppercase italic text-accent-navy">Available Products</h2>
          <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">{category.products.length} Units Found</span>
        </div>

        {category.products.length === 0 ? (
          <div className="py-20 text-center bg-neutral-light rounded-[3rem]">
            <p className="font-black uppercase italic text-neutral-gray">No visible products posted in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {category.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-square bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 p-6">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-gray font-bold">NO INTEL</div>
                  )}
                </div>
                <h3 className="font-black uppercase italic text-accent-navy text-sm tracking-tight truncate group-hover:text-brand-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-brand-primary font-black text-lg italic mt-1">
                  ₦{Number(product.variants?.[0]?.price || 0).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}