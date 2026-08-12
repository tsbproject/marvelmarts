import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

// Define the valid categories to ensure we don't fetch junk
const VALID_CATEGORIES = [
  "order",
  "shipping",
  "payments",
  "account",
  "returns",
  "vendor",
  "refund"
];

interface CategoryPageProps {
  params: Promise<{ categoryName: string }>; 
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // 1. Await the params object (Corrected for Next.js 15+)
  const resolvedParams = await params;
  const { categoryName } = resolvedParams;
  
  if (!categoryName) notFound();

  const normalizedCategory = categoryName.toLowerCase();

  // Security check
  if (!VALID_CATEGORIES.includes(normalizedCategory)) {
    notFound();
  }

 const articles =
  await HelpCenterService.getArticlesByCategory(
    normalizedCategory
  );
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section: Navy Branding */}
      <section className="bg-accent-navy pt-16 pb-28 px-4">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/support" 
            className="inline-flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Support Overview
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-sm md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                {normalizedCategory}
              </h1>
              <p className="mt-4 text-white/50 font-medium text-lg max-w-xl">
                Comprehensive guides and documentation regarding <span className="text-brand-primary uppercase text-sm font-bold">{normalizedCategory}</span> operations on MarvelMarts.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <span className="block text-brand-primary text-3xl font-black">{articles.length}</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Available Articles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-6xl mx-auto px-4 -mt-14 pb-24">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/support/articles/${article.slug}`}
                className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-accent-navy/10 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-accent-navy transition-all duration-300">
                      <BookOpen size={24} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
                       <ChevronRight className="text-brand-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-accent-navy mb-3 uppercase tracking-tight leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-neutral-gray text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-gray group-hover:text-accent-navy transition-colors">
                    View Guide
                  </span>
                  <span className="text-[9px] font-bold text-neutral-gray/40">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-gray-100">
             <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={40} className="text-neutral-gray/20" />
             </div>
             <h2 className="text-2xl font-black text-accent-navy uppercase italic">No Content Available</h2>
             <p className="text-neutral-gray mt-2 mb-8 max-w-sm mx-auto">
                We are currently updating our {normalizedCategory} documentation. Please check back shortly or contact live support.
             </p>
             <Link href="/support" className="inline-block bg-accent-navy text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-primary hover:text-accent-navy transition-all">
                Return to Help Center
             </Link>
          </div>
        )}
      </main>
    </div>
  );
}


export async function generateMetadata({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = resolvedParams.categoryName;
  
  // Capitalize first letter for a cleaner tab title
  const displayTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return { 
    title: `${displayTitle} Help | MarvelMarts Support` 
  };
}