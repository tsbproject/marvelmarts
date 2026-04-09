// components/AboutSection.tsx
import React from 'react';
import Image from 'next/image'; 

export default function AboutSection() {
  return (
    <section className="bg-slate-50 py-20 px-4 md:px-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="">
          
          {/* Left: Branding & Narrative */}
          <div className="w-full lg:w-full">
            <h2 className="xxs:text-[20px] text-2xl lg:text-3xl font-extrabold text-[#000080] mb-6 tracking-tight">
              Redefining the Marketplace
            </h2>
            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              <strong>MarvelMarts</strong> is a proudly Nigerian multi-vendor e-commerce marketplace 
              built with one clear purpose: to empower merchants and delight customers.
            </p>
            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              We created <strong>MarvelMarts</strong> because we saw a gap in the market,
              a platform that truly puts vendors first while delivering a seamless, 
              trustworthy, and enjoyable shopping experience for everyday Nigerians. 
              Unlike traditional marketplaces that focus mainly on buyers or 
              treat sellers as an afterthought, MarvelMarts 
              was designed from the ground up as a vendor-centric ecosystem.
            </p>
            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              Our platform gives small businesses, artisans, entrepreneurs, 
              and established brands the tools they need to succeed online, 
              powerful vendor dashboards, real-time analytics, product Boost 
              Credits for better visibility, flexible store customization, 
              and reliable order management. At the same time, 
              customers enjoy a modern, fast, and secure 
              shopping journey with access to quality products 
              across Fashion, Electronics, Health & Beauty,
               Home & Kitchen, and many more categories.
            </p>

            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              Built with modern technology, <strong>MarvelMarts</strong> combines global 
              best practices with deep local understanding. We support popular
               Nigerian payment methods, partner with reliable logistics providers,
                and continuously improve based on real feedback from both vendors 
                and customers.
            </p>

            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              <strong>At the heart of everything we do is a simple belief:</strong>
              Commerce should create opportunities for everyone, helping 
              vendors grow sustainable businesses while giving customers 
              convenience, choice, and trust.
            </p>

            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
              Today, <strong>MarvelMarts</strong> is more than just an online marketplace.  
              We are building the foundation for a vibrant digital commerce 
              ecosystem that supports Nigerian entrepreneurship and makes 
              quality products accessible to millions of people across the country.
            </p>

            <p className="text-sm md:text-md text-slate-600 leading-relaxed mb-6">
             Welcome to <strong>MarvelMarts</strong>, where vendors thrive and customers shop with confidence.

            </p>

           
          </div>

          {/* Right: Feature Highlights */}
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Secure Checkouts', desc: 'Encrypted payments via Paystack.', icon: '🛡️' },
              { title: 'Verified Quality', desc: 'Strict vendor vetting process.', icon: '✅' },
              { title: 'Fast Logistics', desc: 'Reliable delivery across the nation.', icon: '🚚' },
              { title: 'Vendor Growth', desc: 'Tools for sellers to scale fast.', icon: '📈' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}