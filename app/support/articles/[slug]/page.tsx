import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import SupportSearchMini from "@/app/_components/SupportSearchMini";
import ArticleFeedback from "@/app/_components/ArticleFeedback";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

 /* -------------------------------------------------------------------------- */
/*                          FETCH ARTICLE                                     */
/* -------------------------------------------------------------------------- */

const article =
  await HelpCenterService.getPublicArticleBySlug(
    slug
  );

  if (!article) notFound();

  /* -------------------------------------------------------------------------- */
/*                      FETCH RELATED ARTICLES                                */
/* -------------------------------------------------------------------------- */

const relatedArticles =
  await HelpCenterService.getRelatedArticles(
    article.category,
    article.id
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <Link
            href="/support"
            className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Help Center</span>
          </Link>

          <SupportSearchMini />

          <div className="hidden md:block w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
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

            <div
              className="prose prose-blue max-w-none text-gray-700 leading-loose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <ArticleFeedback articleId={article.id} title={article.title} />
          </article>

          <aside className="lg:col-span-4 space-y-10">
            <div className="p-8 bg-gray-50 rounded-4xl border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                Related Articles
              </h3>

              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/support/articles/${rel.slug}`}
                    className="block group"
                  >
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-tighter">
                      Read Article →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const articles =
    await HelpCenterService.getArticleSlugs();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}