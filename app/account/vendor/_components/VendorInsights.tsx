import React from 'react';
import { Trophy, ShieldCheck, TrendingUp, Zap, Star } from 'lucide-react';
import { calculateVendorTier, calculateReputationScore } from '../../../lib/utils/vendorAnalytics';


interface VendorInsightsProps {
  stats: {
    rating: number;
    totalSales: number;
    fulfillmentRate: number; // e.g., 98 for 98%
    reviewsCount: number;
  }
}

const VendorInsights = ({ stats }: VendorInsightsProps) => {
  const tier = calculateVendorTier(stats.totalSales, stats.rating);
  const reputation = calculateReputationScore(stats.rating, stats.fulfillmentRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* 1. VENDOR TIER CARD */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
          <Trophy size={120} color={tier.color} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Merchant Standing</p>
        <h4 className="text-3xl font-black italic uppercase mb-1" style={{ color: tier.color }}>
          {tier.label} TIER
        </h4>
        <div className="flex items-center gap-2 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
          <Zap size={12} className="text-[#F7931E]" />
          <span className="text-[9px] font-bold text-slate-900 uppercase">{tier.bonus}</span>
        </div>
      </div>

      {/* 2. REPUTATION SCORE */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Operational Trust</p>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black text-accent-navy tracking-tighter">{reputation}%</span>
          <div className="flex flex-col mb-1">
             <div className="flex gap-0.5 mb-1">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={10} className={i < Math.floor(stats.rating) ? "fill-[#F7931E] text-[#F7931E]" : "text-gray-200"} />
               ))}
             </div>
             <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Combat Ready</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-accent-navy h-full transition-all duration-1000" 
            style={{ width: `${reputation}%` }} 
          />
        </div>
      </div>

      {/* 3. INSIGHTS GENERATOR */}
      <div className="bg-[#002B5B] p-6 rounded-[2rem] shadow-xl text-white">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">AI Intelligence</p>
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
              <ShieldCheck size={14} className="text-blue-300" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed">
              Your <span className="text-[#F7931E] font-bold">Fulfillment Rate</span> is top 5% in your category.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
              <Zap size={14} className="text-[#F7931E]" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed">
              Use <span className="font-bold underline">Boost Credits</span> to increase visibility on your lowest-rated product.
            </p>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default VendorInsights;