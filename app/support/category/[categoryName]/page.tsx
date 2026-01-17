import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
  // Decode the category name (e.g., "Shipping%20Details" -> "Shipping Details")
  const category = decodeURIComponent(params.categoryName);

  const articles = await prisma.helpArticle.findMany({
    where: { 
      category: {
        equals: category,
        mode: 'insensitive' // Makes the URL case-insensitive
      } 
    },
    orderBy: { title: 'asc' }
  });

  if (articles.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Link 
          href="/support" 
          className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Support Home
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            {category}
          </h1>
          <p className="text-gray-500 text-lg">
             {articles.length} {articles.length === 1 ? 'article' : 'articles'} to help you with {category.toLowerCase()}.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/support/articles/${article.slug}`}
              className="group bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Generate dynamic metadata for the category
export async function generateMetadata({ params }: { params: { categoryName: string } }) {
  const category = decodeURIComponent(params.categoryName);
  return { title: `${category} Support | Help Center` };
}