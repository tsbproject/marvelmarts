"use client";

import { Star, User, ShieldCheck, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ReviewList() {
  const { items: reviews } = useSelector((state: RootState) => state.reviews);

  // --- Tactical Analytics ---
  const totalReviews = reviews.length;
  
  // 1. Filter for Highlights: Verified + Rating >= 4
  const highlights = reviews
    .filter((r: any) => r.isVerified && r.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // 2. The rest of the reviews
  const regularReviews = reviews.filter(
    (r) => !highlights.find((h) => h.id === r.id)
  );

  if (totalReviews === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          No tactical reports filed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* ... (Keep the Breakdown Dashboard from previous step) ... */}

      {/* --- Tactical Highlights (Top 3) --- */}
      {highlights.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#F7931E] flex items-center gap-2">
            <Zap size={14} className="fill-[#F7931E]" />
            High-Value Intelligence
          </h3>
          <div className="grid gap-4">
            {highlights.map((review) => (
              <ReviewCard key={review.id} review={review} isHighlight />
            ))}
          </div>
        </div>
      )}

      {/* --- Standard Feed --- */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#002B5B] flex items-center gap-2">
          <span className="w-8 h-[2px] bg-gray-200"></span>
          All Field Reports
        </h3>
        <div className="grid gap-4">
          {regularReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function ReviewCard({ review, isHighlight = false }: { review: any; isHighlight?: boolean }) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${
      isHighlight 
      ? "bg-white border-[#F7931E]/30 shadow-lg shadow-[#F7931E]/5 scale-[1.02]" 
      : "bg-white border-gray-100 shadow-sm"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighlight ? 'bg-[#F7931E] text-white' : 'bg-[#002B5B] text-white'}`}>
            <User size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase text-[#002B5B]">{review.user?.name || "Anonymous"}</p>
              {review.isVerified && (
                <span className="flex items-center gap-1 bg-green-50 text-[7px] text-green-600 px-2 py-0.5 rounded-full font-black border border-green-100 uppercase">
                  <ShieldCheck size={10} /> Verified
                </span>
              )}
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} className={i < review.rating ? "fill-[#F7931E] text-[#F7931E]" : "text-gray-200"} />
          ))}
        </div>
      </div>
      <p className="text-sm text-[#4B4B4B] italic leading-relaxed pl-4 border-l-2 border-[#F7931E]/20">
        "{review.body}"
      </p>
    </div>
  );
}