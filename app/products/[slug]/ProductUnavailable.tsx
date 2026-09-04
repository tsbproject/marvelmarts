import Link from "next/link";
import { ArrowLeft, ShoppingBag, Store } from "lucide-react";

interface ProductUnavailableProps {
  title: string;
  imageUrl?: string | null;
}

export default function ProductUnavailable({
  title,
  imageUrl,
}: ProductUnavailableProps) {
  return (
    <main className="min-h-[70vh] bg-[#FBFBFB] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16">
          {/* Product image */}
          {imageUrl ? (
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Status icon */}
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Store className="h-6 w-6 text-gray-500" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
            Product unavailable
          </p>

          <h1 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-brand-black sm:text-3xl">
            This product is temporarily unavailable
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            <span className="font-medium text-gray-800">{title}</span>{" "}
            isn't available for purchase right now. It may become
            available again soon.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-black px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}