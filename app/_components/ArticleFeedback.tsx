"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ArticleFeedback({ articleId, title }: { articleId: string, title: string }) {
  const [voteType, setVoteType] = useState<"helpful" | "notHelpful" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (type: "helpful" | "notHelpful") => {
    setLoading(true);
    try {
      await fetch(`/api/support/articles/vote`, {
        method: "POST",
        body: JSON.stringify({ id: articleId, type }),
      });
      setVoteType(type);
    } catch (error) {
      console.error("Vote failed", error);
    } finally {
      setLoading(false);
    }
  };

  // If they voted "Yes"
  if (voteType === "helpful") {
    return (
      <div className="mt-16 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3 text-green-700">
        <CheckCircle2 size={24} />
        <p className="font-bold">Glad we could help! Thanks for the feedback.</p>
      </div>
    );
  }

  // If they voted "No"
  if (voteType === "notHelpful") {
    return (
      <div className="mt-16 p-8 bg-blue-50 rounded-4xl border border-blue-100 animate-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-xl font-black text-blue-900 mb-2">We're sorry this didn't help.</h3>
        <p className="text-blue-700 mb-6 font-medium">Would you like to speak with a support agent about "{title}"?</p>
        <Link 
          href={`/support/contact?ref=${articleId}&subject=Help with ${encodeURIComponent(title)}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <MessageSquare size={18} />
          Open a Support Ticket
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-10 mt-16">
      <p className="text-gray-900 font-black uppercase text-xs tracking-widest mb-4">Was this article helpful?</p>
      <div className="flex gap-3">
        <button
          onClick={() => handleVote("helpful")}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all font-bold text-sm disabled:opacity-50 bg-white"
        >
          <ThumbsUp size={18} /> Yes
        </button>
        <button
          onClick={() => handleVote("notHelpful")}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:border-red-600 hover:text-red-600 transition-all font-bold text-sm disabled:opacity-50 bg-white"
        >
          <ThumbsDown size={18} /> No
        </button>
      </div>
    </div>
  );
}