import { ReviewService } from "@/app/lib/services/review.service";
import AdminReviewClient from "./AdminReviewClient";

export default async function AdminReviewsPage() {

  const allReviews =
    await ReviewService.getAdminReviews();

  const sanitizedReviews =
    allReviews.map((review) => ({
      ...review,
      createdAt:
        review.createdAt.toISOString(),
      updatedAt:
        review.updatedAt.toISOString(),
    }));

  return (
    <div className="p-6">
      <header className="mb-10">
        <h1 className="text-2xl font-black italic text-[#002B5B] uppercase tracking-tighter">
          Review <span className="text-[#F7931E]">
            Intelligence
          </span>
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Buyers Command Center /
            {" "}
            {allReviews.length}
            {" "}
            Reports Logged
          </p>
        </div>
      </header>

      <AdminReviewClient
        initialReviews={sanitizedReviews}
      />
    </div>
  );
}