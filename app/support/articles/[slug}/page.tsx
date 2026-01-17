import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, Share2 } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: `Support | ${params.slug.replace('-', ' ')}` };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.helpArticle.findUnique({
    where: { slug: params.slug },
  });

  if (!article) {
    notFound(); // Redirects to your 404 page if slug is invalid
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Breadcrumbs & Back Button */}
        <Link 
          href="/support" 
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Help Center
        </Link>

        {/* Article Header */}
        <header className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              {article.category}
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock size={12} />
              <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>
          
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            {article.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-blue max-w-none">
          {/* Using dangerouslySetInnerHTML if you plan to use rich text/markdown later */}
          <div className="text-gray-700 leading-loose space-y-6">
             {article.content.split('\n').map((paragraph, i) => (
               <p key={i}>{paragraph}</p>
             ))}
          </div>

          {/* Keywords Section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Tag size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((word) => (
                <span key={word} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-lg border border-gray-100">
                  #{word}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Helpful Feedback Section */}
        <div className="mt-8 bg-blue-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-blue-200">
          <h3 className="text-xl font-bold mb-2">Was this article helpful?</h3>
          <p className="text-blue-100 text-sm mb-6">Your feedback helps us improve our support experience.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-colors">Yes</button>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-400 transition-colors border border-blue-400">No</button>
          </div>
        </div>
      </div>
    </div>
  );
}