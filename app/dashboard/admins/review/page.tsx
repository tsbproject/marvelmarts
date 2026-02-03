import { prisma } from "@/app/lib/prisma";
import AdminReviewClient from "./AdminReviewClient";

export default async function AdminReviewsPage() {
  // 1. Fetching all reviews with product and user context
  const allReviews = await prisma.review.findMany({
    include: {
      product: { select: { title: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. TACTICAL SANITIZATION
  // We explicitly map EVERY potential date field to an ISO string.
  // This prevents the "non-serializable value" error in Redux.
  const sanitizedReviews = allReviews.map(review => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(), // The missing link that caused the error
    // Ensure nested user/product dates aren't sneaking through if they exist
  }));

  return (
    <div className="p-6">
      <header className="mb-10">
        <h1 className="text-2xl font-black italic text-[#002B5B] uppercase tracking-tighter">
          Review <span className="text-[#F7931E]">Intelligence</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Buyers Command Center / {allReviews.length} Reports Logged
          </p>
        </div>
      </header>
      
      {/* 3. Passing sanitized data to the Client Hydrator */}
      <AdminReviewClient initialReviews={sanitizedReviews} />
    </div>
  );
}