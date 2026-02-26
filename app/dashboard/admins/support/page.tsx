import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Edit, FileText, ExternalLink, ThumbsUp, AlertTriangle } from "lucide-react";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function AdminSupportPage() {
  const articles = await prisma.helpArticle.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Support Articles</h1>
          <p className="text-gray-500 font-medium">Manage your knowledge base and track user satisfaction.</p>
        </div>
        <Link 
          href="/dashboard/admins/support/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          Create Article
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Article Title</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Helpful</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Issues</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Last Updated</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((article) => {
              const totalVotes = (article.helpful || 0) + (article.notHelpful || 0);
              const score = totalVotes > 0 
                ? Math.round((article.helpful / totalVotes) * 100) 
                : null;

              return (
                <tr key={article.id} className="hover:bg-blue-50/30 transition-colors group">
                  {/* Title & Slug */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{article.title}</p>
                        <p className="text-xs text-gray-400 font-medium">/{article.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category Tag */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-full">
                      {article.category}
                    </span>
                  </td>

                  {/* Helpful Metric */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <ThumbsUp size={12} /> {article.helpful || 0}
                      </span>
                      {score !== null && (
                        <span className="text-[9px] font-black text-gray-400 uppercase">{score}% rate</span>
                      )}
                    </div>
                  </td>

                  {/* Issues Metric */}
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold inline-flex items-center gap-1 ${article.notHelpful > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                      {article.notHelpful > 0 && <AlertTriangle size={12} />}
                      {article.notHelpful || 0}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Public View */}
                      <Link 
                        href={`/support/articles/${article.slug}`} 
                        target="_blank" 
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Live"
                      >
                        <ExternalLink size={18} />
                      </Link>

                      {/* Edit Page */}
                      <Link 
                        href={`/dashboard/admins/support/edit/${article.id}`} 
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Article"
                      >
                        <Edit size={18} />
                      </Link>

                      {/* Delete Client Component */}
                      <DeleteArticleButton id={article.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {articles.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No articles found. Start by creating one.</p>
          </div>
        )}
      </div>
    </div>
  );
}