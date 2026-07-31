import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Rocket, Users, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "About Us | MarvelMarts - Nigeria's Vendor-Centric Marketplace",
  description: "Learn how MarvelMarts is empowering Nigerian merchants and delivering a seamless shopping experience for customers.",
};

export default function AboutPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative py-10 lg:py-32 bg-[#001f3f] text-white rounded-2xl                                overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-3 relative z-10 text-center">
          <h1 className="text-2xl md:text-4xl font-black mb-6 tracking-tight">
            Empowering Merchants. <br />
            <span className="text-brand-primary">Delighting Customers.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-sm text-gray-300 leading-relaxed font-medium">
            MarvelMarts is a proudly Nigerian multi-vendor e-commerce marketplace built with one clear purpose: to empower merchants and delight customers.
          </p>
        </div>
      </section>

      {/* The Gap & Purpose */}
      <section className="py-20 max-w-7xl mx-auto px-3">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#001f3f]">Why We Created MarvelMarts</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We created <span className="font-bold text-gray-900">MarvelMarts</span> because we saw a gap in the market, a platform that truly puts vendors first while delivering a seamless, trustworthy, and enjoyable shopping experience for everyday Nigerians.
            </p>
            <p className="text-sm  text-gray-600 leading-relaxed">
              Unlike traditional marketplaces that focus mainly on buyers or treat sellers as an afterthought, MarvelMarts was designed from the ground up as a vendor-centric ecosystem.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 shadow-sm">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-2 lg:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <Rocket className="text-blue-600 mb-4" size={32} />
                   <h4 className="font-bold text-xs lg:text-md mb-1">Growth</h4>
                   <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-widest">For Vendors</p>
                </div>
                <div className="p-2 lg:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <ShieldCheck className="text-green-600 mb-4" size={32} />
                   <h4 className="font-bold text-xs lg:text-md mb-1">Trust</h4>
                   <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-widest">For Shoppers</p>
                </div>
                <div className="p-2 lg:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <Users className="text-orange-600 mb-4" size={32} />
                   <h4 className="font-bold text-xs lg:text-md mb-1">Community</h4>
                   <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-widest">Local Support</p>
                </div>
                <div className="p-2 lg:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <ShoppingBag className="text-purple-600 mb-4" size={32} />
                   <h4 className="font-bold text-xs lg:text-md mb-1">Choice</h4>
                   <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-widest">Global Standards</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Split */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-5 rounded-3xl border border-gray-200">
              <h3 className="text-lg md:text-xl  font-bold mb-4 text-aceent-navy">The Merchant Experience</h3>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "Our platform gives small businesses, artisans, entrepreneurs, and established brands the tools they need to succeed with online powerful vendor dashboards, real-time analytics, product Boost Credits for better visibility, flexible store customization, and reliable order management."
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-accent-navy">The Customer Journey</h3>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "At the same time, customers enjoy a modern, fast, and secure shopping journey with access to quality products across Fashion, Electronics, Health & Beauty, Home & Kitchen, and many more categories."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Belief & Tech */}
      <section className="py-15 max-w-5xl mx-auto px-2 text-center">
        <h2 className="text-lg font-bold mb-8">Modern Technology, Local Soul</h2>
        <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
          <p>
            Built with modern technology, <span className="text-gray-900 text-sm font-semibold">MarvelMarts</span> combines global best practices with deep local understanding. We support popular Nigerian payment methods, partner with reliable logistics providers, and continuously improve based on real feedback from both vendors and customers.
          </p>
          <div className="py-8">
            <blockquote className="text-sm md:text-lg font-light text-gray-900 italic border-l-4 border-blue-600 pl-8 text-left max-w-3xl mx-auto">
              "At the heart of everything we do is a simple belief: Commerce should create opportunities for everyone, helping vendors grow sustainable businesses while giving customers convenience, choice, and trust."
            </blockquote>
          </div>
          <p>
            Today, <span className="text-gray-900 text-sm font-semibold">MarvelMarts</span> is more than just an online marketplace. We are building the foundation for a vibrant digital commerce ecosystem that supports Nigerian entrepreneurship and makes quality products accessible to millions of people across the country.
          </p>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Welcome to MarvelMarts</h2>
          <p className="text-xl text-gray-500 mb-10">Where vendors thrive and customers shop with confidence.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register/vendor-registration" className="px-10 py-4 bg-[#001f3f] text-white rounded-full font-bold hover:bg-blue-900 transition-all">
              Start Selling
            </Link>
            <Link href="/shop" className="px-10 py-4 border-2 border-gray-200 text-gray-900 rounded-full font-bold hover:bg-white hover:border-blue-600 transition-all">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}