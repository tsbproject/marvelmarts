"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { submitReview } from "@/store/reviewsSlice";
import { useNotification } from "@/app/_context/NotificationContext";

export default function AddReview({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.reviews);
  const { notifySuccess, notifyError } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return notifyError("Assign a star rating to this gear.");

    // TACTICAL ALIGNMENT: 
    // We send 'comment' from our local state, but we ensure the Thunk
    // in reviewsSlice.ts maps it to the 'body' field for the API.
    const result = await dispatch(submitReview({ 
      productId, 
      rating, 
      comment 
    }));
    
    if (submitReview.fulfilled.match(result)) {
      notifySuccess("Intel received! Review pending tactical approval.");
      setRating(0);
      setComment("");
    } else {
      // result.payload would contain the specific error from the 500 crash
      notifyError("Failed to sync review with HQ. Check connection.");
    }
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-12">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black italic text-[#002B5B] uppercase mb-2">Operational Feedback</h3>
        <p className="text-[10px] text-[#4B4B4B] uppercase tracking-widest mb-6">Verified Buyer Status Required</p>
        
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={loading}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-all active:scale-90 disabled:opacity-50"
            >
              <Star
                size={32}
                className={`${
                  star <= (hover || rating) ? "fill-[#F7931E] text-[#F7931E]" : "text-gray-100"
                } transition-colors duration-200`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          disabled={loading}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Detailed field report (Optional)..."
          className="w-full bg-[#F8F8F8] border-2 border-transparent focus:border-[#F7931E] rounded-2xl p-5 text-sm outline-none transition-all min-h-[150px] mb-6 font-bold text-[#002B5B]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#002B5B] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#F7931E] transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Syncing with HQ...
            </>
          ) : (
            "Post  Review"
          )}
        </button>
      </form>
    </div>
  );
}