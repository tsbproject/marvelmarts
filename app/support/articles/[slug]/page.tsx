import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown"; 
import SupportSearchMini from "@/app/_components/SupportSearchMini";
import ArticleFeedback from "@/app/_components/ArticleFeedback";


export default async function ArticleDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {

  const { slug } = await params;

  
  const article = await prisma.helpArticle.findUnique({
    where: { slug: slug },
  });

  if (!article) notFound();

  // Fetch other articles in the same category for the sidebar
  const relatedArticles = await prisma.helpArticle.findMany({
    where: { 
      category: article.category,
      NOT: { id: article.id } 
    },
    take: 5
  });

  return (
    <div className="min-h-screen bg-white pb-20">

       {/* Search & Navigation Header */}
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <Link 
            href="/support" 
            className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Help Center</span>
          </Link>
          
          <SupportSearchMini />
          
          <div className="hidden md:block w-32" /> {/* Spacer for centering */}
        </div>
      </div>


      {/* Breadcrumbs / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link 
          href="/support" 
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Help Center
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <article className="lg:col-span-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                <Calendar size={14} />
                {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-xl text-gray-500 font-medium italic leading-relaxed border-l-4 border-blue-100 pl-6">
              {article.excerpt}
            </p>
          </div>

          <hr className="border-gray-100 mb-10" />

          {/* Article Body */}
          <div className="prose prose-blue max-w-none text-gray-700 leading-loose">
            {/*  using react-markdown: */}
            <ReactMarkdown>{article.content}</ReactMarkdown>
            
            {/* NOT using markdown, use this instead: */}
            {/* <div className="whitespace-pre-wrap">{article.content}</div> */}
          </div>
          {/* FEEDBACK SYSTEM */}
        <ArticleFeedback articleId={article.id} title={article.title} />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="p-8 bg-gray-50 rounded-4xl border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Related Articles</h3>
            <div className="space-y-4">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((rel) => (
                  <Link 
                    key={rel.id} 
                    href={`/support/articles/${rel.slug}`}
                    className="block group"
                  >
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-tighter">Read Article →</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No other articles in this category yet.</p>
              )}
            </div>
          </div>

          <div className="p-8 bg-blue-600 rounded-4xl text-white">
            <h3 className="text-xl font-black mb-2">Need more help?</h3>
            <p className="text-blue-100 text-sm mb-6">Our support agents are ready to assist you via live chat or email.</p>
            <Link 
              href="/support/contact" 
              className="block w-full text-center py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}