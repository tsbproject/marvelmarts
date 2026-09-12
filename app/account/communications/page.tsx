import Link from "next/link";

export default function LegacyCommunicationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-5 sm:p-8 lg:p-10">
      <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#002B5B] text-white flex items-center justify-center mx-auto">
          <span className="text-2xl font-black">M</span>
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-[#002B5B]">
          Communications Have Moved
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-500 leading-7">
          MarvelMarts communications are now separated between customer
          and vendor accounts. Please choose the communications area
          you want to open.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/customer/communications"
            className="rounded-2xl bg-[#002B5B] text-white px-5 py-4 text-sm font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Customer Communications
          </Link>

          <Link
            href="/account/vendor/communications"
            className="rounded-2xl border border-[#002B5B] bg-white text-[#002B5B] px-5 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Vendor Communications
          </Link>
        </div>
      </div>
    </div>
  );
}
