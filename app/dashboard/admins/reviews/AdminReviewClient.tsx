"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAdminReviews } from "@/store/adminSlice";
import AdminReviewManager from "./AdminReviewManager";

export default function AdminReviewClient({ initialReviews }: { initialReviews: any[] }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Synchronize Server Data with Redux Store on mount
    dispatch(setAdminReviews(initialReviews));
  }, [dispatch, initialReviews]);

  return <AdminReviewManager />;
}