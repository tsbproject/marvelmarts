import React from 'react';
import { ShieldCheck, RotateCcw, Truck, AlertCircle } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-accent-navy selection:bg-brand-primary selection:text-white">
      {/* Hero Section */}
      <div className="bg-accent-navy py-20 px-6 text-center border-b-8 border-brand-primary">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4">
          Return <span className="text-brand-primary text-outline">Protocols</span>
        </h1>
        <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">
          Transparency in Every Transaction
        </p>
      </div>

      <div className="max-w-5xl mx-auto py-16 px-6">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <ProtocolCard 
            icon={<RotateCcw className="text-brand-primary" size={32} />}
            title="7-Day Window"
            description="Requests must be initiated within 7 days of delivery confirmation."
          />
          <ProtocolCard 
            icon={<ShieldCheck className="text-brand-primary" size={32} />}
            title="Mint Condition"
            description="Items must be unworn, with original tags and MarvelMarts security packaging intact."
          />
          <ProtocolCard 
            icon={<Truck className="text-brand-primary" size={32} />}
            title="Rapid Processing"
            description="Refunds are processed within 3-7 business days after quality inspection."
          />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-black italic uppercase mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-accent-navy text-white rounded-full flex items-center justify-center text-lg not-italic">01</span>
              Eligibility Criteria
            </h2>
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4 text-gray-600 font-medium leading-relaxed">
              <p>To ensure the quality of gear for all customers, returns are only accepted if:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>The item is in its original, unwashed, and unused condition.</li>
                <li>All MarvelMarts holographic tags and labels are attached.</li>
                <li>The item was not purchased during a "Final Sale" or "Vault Clearance" event.</li>
                <li>Footwear shows no signs of outdoor use (try them on a carpeted surface).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black italic uppercase mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-accent-navy text-white rounded-full flex items-center justify-center text-lg not-italic">02</span>
              Non-Returnable Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Intimate Apparel', 'Personal Care / Grooming', 'Customized Gear', 'Downloadable Tech'].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 border-2 border-red-50 rounded-2xl bg-red-50/30">
                  <AlertCircle size={20} className="text-red-500" />
                  <span className="font-black uppercase italic text-xs tracking-wider">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black italic uppercase mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-accent-navy text-white rounded-full flex items-center justify-center text-lg not-italic">03</span>
              The Refund Process
            </h2>
            <div className="border-l-4 border-accent-navy ml-5 pl-10 space-y-8 relative">
              <TimelineStep number="1" title="Initiation" desc="Go to your Dashboard > Orders and click 'Request Refund'." />
              <TimelineStep number="2" title="Courier Pickup" desc="Once approved, our logistics partner will contact you for pickup." />
              <TimelineStep number="3" title="Inspection" desc="Items are sent to the MarvelMarts Vault for quality verification." />
              <TimelineStep number="4" title="Payout" desc="Funds are reversed to your original payment method (Bank or Paystack)." />
            </div>
          </section>
        </div>

        {/* Support Call to Action */}
        <div className="mt-20 p-10 bg-brand-primary rounded-[3rem] text-center text-white">
          <h3 className="text-2xl font-black uppercase italic italic mb-2">Need Direct Assistance?</h3>
          <p className="font-bold opacity-80 mb-6 uppercase text-xs tracking-widest">Our Support Team is standing by.</p>
          <a href="mailto:support@marvelmarts.com" className="inline-block bg-accent-navy text-white px-10 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
function ProtocolCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-black italic uppercase mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function TimelineStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[54px] top-0 w-6 h-6 bg-brand-primary rounded-full border-4 border-white shadow-sm" />
      <h4 className="text-lg font-black uppercase italic text-accent-navy mb-1">{number}. {title}</h4>
      <p className="text-gray-500 font-medium text-sm">{desc}</p>
    </div>
  );
}