import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { 
  Search, 
  ChevronRight, 
  Package, 
  ShieldCheck, 
  CreditCard, 
  User, 
  LifeBuoy,
  ArrowUpRight
} from "lucide-react";

// Map icons to your categories
const categoryIcons: Record<string, any> = {
  "Shipping": Package,
  "Payments": CreditCard,
  "Account": User,
  "Security": ShieldCheck,
  "Default": LifeBuoy
};

export default async function SupportLandingPage() {
  // Fetch all categories with article counts
  const categoryData = await prisma.helpArticle.groupBy({
    by: ['category'],
    _count: { _all: true }
  });

  // Fetch 4 featured/recent articles
  const featuredArticles = await prisma.helpArticle.findMany({
    take: 4,
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Search Section */}
      <section className="relative py-20 bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            How can we help?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search for articles (e.g. 'refunds', 'tracking')..."
              className="w-full h-16 pl-14 pr-6 rounded-2xl text-gray-900 text-lg shadow-2xl focus:ring-4 focus:ring-blue-400 outline-none transition-all"
              // In a real app, you'd wrap this input in a Client Component for live search
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest">Browse by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryData.map((cat) => {
            const Icon = categoryIcons[cat.category] || categoryIcons.Default;
            return (
              <Link 
                key={cat.category}
                href={`/support/category/${encodeURIComponent(cat.category)}`}
                className="group p-8 rounded-[32px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.category}</h3>
                <p className="text-sm text-gray-500 font-medium">
                  {cat._count._all} Articles
                </p>
                <div className="mt-4 flex items-center text-blue-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  View All <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Featured Articles</h2>
              <p className="text-gray-500 mt-2 font-medium">Most commonly read help guides</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <Link 
                key={article.id}
                href={`/support/articles/${article.slug}`}
                className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 group transition-all"
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{article.excerpt}</p>
                </div>
                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Footer */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6">
            <LifeBuoy size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-500 mb-10">Our team is available 24/7 to assist you with any questions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/contact" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
              Contact Us
            </Link>
            <Link href="/support/live-chat" className="px-10 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
              Live Chat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}