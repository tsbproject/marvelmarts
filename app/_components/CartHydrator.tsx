"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/cartSlice"; // We'll add a 'loadCart' action next

export default function CartHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedCart = localStorage.getItem("marvel_cart");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        // We use a custom action to set the whole cart at once
        dispatch({ type: "cart/hydrateCart", payload: items });
      } catch (e) {
        console.error("Failed to load cart", e);
        localStorage.removeItem("marvel_cart");
      }
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
}