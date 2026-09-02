import Link from "next/link";
import { WifiOff, RefreshCw, ShoppingBag } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBFBFB] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5">
          <img
            src="/icon-192.png"
            alt="MarvelMarts"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <WifiOff className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-brand-black">
          You&apos;re offline
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          MarvelMarts couldn&apos;t connect to the internet.
          Check your connection and try again.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-brand-black transition hover:bg-gray-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Back to MarvelMarts
          </Link>
        </div>
      </div>
    </main>
  );
}