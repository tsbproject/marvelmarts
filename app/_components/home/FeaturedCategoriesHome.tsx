
// app/_components/home/FeaturedCategoriesHome.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/** * TACTICAL INTERFACE
 * Matches the serialization from the HomePage perfectly.
 */
interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string; 
  _count: {
    products: number;
  };
}

interface FeaturedCategoriesHomeProps {
  categories: FeaturedCategory[];
}

export default function FeaturedCategoriesHome({ categories }: FeaturedCategoriesHomeProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 px-4 max-w-[1400px] mx-auto">
      {/* Tactical Header */}
      <div className="grid grid-cols-2 items-end justify-between mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] bg-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
              Category Registry
            </span>
          </div>
          <h2 className="text-sm md:text-xl font-black uppercase italic tracking-tighter text-accent-navy">
            Featured <span className="text-brand-primary">Categories</span>
          </h2>
        </div>
        
        <Link 
          href="/categories" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all"
        >
          Access All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/categories/${category.slug}`}
            className="group relative h-[320px] overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="absolute inset-0 p-4">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 16vw"
                />
              </div>
            </div>
            
            {/* Dark Tactical Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
            
            {/* Content Bottom */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-brand-primary text-[9px] font-black uppercase tracking-widest mb-1 drop-shadow-sm">
                {category._count.products} Products Found
              </p>
              <h3 className="text-[11px] font-black text-white uppercase tracking-tight leading-none">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}