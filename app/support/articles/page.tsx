import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { HelpCenterService } from "@/app/lib/services/help-center.service";

export default async function ArticlesListPage() {
  const articles =
    await HelpCenterService.getPublishedArticles();

  return (
    <div className="min-h-screen bg-brand-ghost py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black italic uppercase text-brand-black mb-8">
          Support{" "}
          <span className="text-brand-orange">
            Articles
          </span>
        </h1>

        <div className="grid gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/support/articles/${article.slug}`}
              className="bg-brand-white p-6 rounded-3xl border border-brand-orange-light hover:border-brand-orange transition-all group flex items-center justify-between shadow-sm"
            >
              <div>
                <span className="text-[10px] font-black uppercase text-brand-orange tracking-widest mb-2 block">
                  {article.category}
                </span>

                <h2 className="text-xl font-bold text-brand-black group-hover:text-brand-orange transition-colors">
                  {article.title}
                </h2>
              </div>

              <ChevronRight className="text-brand-gray group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}