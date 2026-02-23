import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, Package, ChevronLeft, Tag, Layers } from "lucide-react";

export default async function ProductDetailPage({ 
          params 
        }: { 
          params: Promise<{ slug: string }> // Change this to a Promise
        }) {
          // Await the params before using them
          const { slug } = await params; 

          if (!slug) {
            notFound();
          }

          const product = await prisma.product.findUnique({
            where: { slug: slug }, // Use the awaited slug here
            include: {
              images: { orderBy: { order: "asc" } },
              category: true,
            },
          });

          if (!product) notFound();
  
          const formatPrice = (n: any) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(n));

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Link 
          href="/dashboard/admins/products" 
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Products
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/admins/products/${product.slug}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <Edit size={18} /> Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-2xl border bg-white overflow-hidden shadow-sm">
            {product.images[0] ? (
              <img 
                src={product.images[0].url} 
                className="w-full h-full object-contain" 
                alt={product.title} 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <Package size={64} strokeWidth={1} />
                <p className="mt-2">No image uploaded</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {product.images.slice(1).map((img) => (
              <div key={img.id} className="aspect-square rounded-xl border bg-white overflow-hidden hover:ring-2 ring-blue-500 transition-all cursor-pointer">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {product.status}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            <p className="text-2xl font-semibold text-blue-600">{formatPrice(product.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Layers size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Category</p>
                <p className="text-sm font-medium">{product.category?.name || "Uncategorized"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Tag size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Brand</p>
                <p className="text-sm font-medium">{product.brand || "Generic"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Description</h3>
            {/* The Tailwind 'prose' class is key for rendering Tiptap HTML correctly */}
            <div 
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-sm text-gray-600 flex justify-between">
              <span>Current Stock:</span> 
              <span className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                {product.stock} units
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">SKU: {product.sku || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}