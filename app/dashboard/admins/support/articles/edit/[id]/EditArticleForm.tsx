// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Save, ChevronLeft, AlertCircle } from "lucide-react";

// export default function EditArticleForm({ article }: { article: any }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const data = {
//       title: formData.get("title"),
//       category: formData.get("category"),
//       excerpt: formData.get("excerpt"),
//       content: formData.get("content"),
//       keywords: (formData.get("keywords") as string).split(",").map(k => k.trim()),
//     };

//     const res = await fetch(`/api/admins/support?id=${article.id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     });

//     if (res.ok) {
//       router.push("/dashboard/admins/support");
//       router.refresh();
//     } else {
//       alert("Failed to update article");
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <button 
//         onClick={() => router.back()}
//         className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-bold uppercase text-xs"
//       >
//         <ChevronLeft size={16} /> Back to Articles
//       </button>

//       <form onSubmit={handleSubmit} className="space-y-8">
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-black text-gray-900 uppercase">Edit Article</h1>
//           <button 
//             type="submit" 
//             disabled={loading} 
//             className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50"
//           >
//             <Save size={20} />
//             {loading ? "Updating..." : "Update Changes"}
//           </button>
//         </div>

//         <div className="grid grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <label className="text-xs font-black uppercase text-gray-400 ml-2">Title</label>
//             <input name="title" defaultValue={article.title} required className="w-full p-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-black uppercase text-gray-400 ml-2">Category</label>
//             <select name="category" defaultValue={article.category} className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none font-bold">
//               <option>Shipping</option>
//               <option>Payments</option>
//               <option>Account</option>
//               <option>Returns</option>
//             </select>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <label className="text-xs font-black uppercase text-gray-400 ml-2">Excerpt</label>
//           <textarea name="excerpt" defaultValue={article.excerpt} rows={2} required className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none" />
//         </div>

//         <div className="space-y-2">
//           <label className="text-xs font-black uppercase text-gray-400 ml-2">Content (Markdown supported)</label>
//           <textarea name="content" defaultValue={article.content} rows={12} required className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none font-mono text-sm" />
//         </div>

//         <div className="space-y-2">
//           <label className="text-xs font-black uppercase text-gray-400 ml-2">Keywords</label>
//           <input name="keywords" defaultValue={article.keywords.join(", ")} className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none" />
//         </div>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft } from "lucide-react";
import RichTextEditor from "@/app/_components/RichTextEditor";

type Article = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  keywords: string[];
};

export default function EditArticleForm({ article }: { article: Article }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(article.content || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const title = (formData.get("title") as string)?.trim() || "";
      const category = (formData.get("category") as string)?.trim() || "";
      const excerpt = (formData.get("excerpt") as string)?.trim() || "";
      const keywordsRaw = (formData.get("keywords") as string)?.trim() || "";

      const data = {
        title,
        category,
        excerpt,
        content,
        keywords: keywordsRaw
          ? keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch(`/api/admins/support?id=${article.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/dashboard/admins/support");
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error("Failed to update article:", errorData);
        alert("Failed to update article");
      }
    } catch (error) {
      console.error("Update article error:", error);
      alert("Something went wrong while updating the article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-bold uppercase text-xs"
      >
        <ChevronLeft size={16} />
        Back to Articles
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase">
            Edit Article
          </h1>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? "Updating..." : "Update Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">
              Title
            </label>
            <input
              name="title"
              defaultValue={article.title}
              required
              className="w-full p-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-blue-500/5 outline-none font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">
              Category
            </label>
            <select
              name="category"
              defaultValue={article.category}
              className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none font-bold"
            >
              <option value="order">Order</option>
              <option value="shipping">Shipping</option>
              <option value="payments">Payments</option>
              <option value="sccount">Account</option>
              <option value="returns and refund">Returns and Refund</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            defaultValue={article.excerpt}
            rows={2}
            required
            className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">
            Content
          </label>

          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">
            Keywords
          </label>
          <input
            name="keywords"
            defaultValue={Array.isArray(article.keywords) ? article.keywords.join(", ") : ""}
            className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none"
          />
        </div>
      </form>
    </div>
  );
}