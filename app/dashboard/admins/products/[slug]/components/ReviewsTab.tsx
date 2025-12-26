"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
  user?: { id: string; name: string; email: string };
}

interface ReviewInput {
  rating: number;
  title?: string;
  body?: string;
  userId: string;
}

export function ReviewsTab({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<ReviewInput>({
    rating: 5,
    title: "",
    body: "",
    userId: "",
  });

  // Fetch reviews
  useEffect(() => {
    fetch(`/api/products/${slug}/reviews`)
      .then((res) => res.json())
      .then(setReviews)
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [slug]);

  // Add new review
  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReview.userId) {
      alert("User ID is required");
      return;
    }

    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    if (res.ok) {
      const review: Review = await res.json();
      setReviews((prev) => [review, ...prev]);
      setNewReview({ rating: 5, title: "", body: "", userId: "" });
    } else {
      alert("Error adding review");
    }
  }

  // Delete review
  async function handleDeleteReview(id: string) {
    const res = await fetch(`/api/products/${slug}/reviews?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Error deleting review");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Product Reviews</h2>

      {/* Add review form */}
      <form onSubmit={handleAddReview} className="space-y-2 mb-6">
        <input
          type="number"
          min={1}
          max={5}
          value={newReview.rating}
          onChange={(e) =>
            setNewReview({ ...newReview, rating: Number(e.target.value) })
          }
          className="input w-20"
        />
        <input
          type="text"
          placeholder="Title"
          value={newReview.title ?? ""}
          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
          className="input w-full"
        />
        <textarea
          placeholder="Body"
          value={newReview.body ?? ""}
          onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
          className="textarea w-full"
        />
        <input
          type="text"
          placeholder="User ID"
          value={newReview.userId}
          onChange={(e) =>
            setNewReview({ ...newReview, userId: e.target.value })
          }
          className="input w-full"
        />
        <button type="submit" className="btn btn-primary">
          Add Review
        </button>
      </form>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th>Rating</th>
              <th>Title</th>
              <th>Body</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.rating} ⭐</td>
                <td>{r.title ?? "-"}</td>
                <td>{r.body ?? "-"}</td>
                <td>{r.user ? r.user.name : "Unknown user"}</td>
                <td>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
