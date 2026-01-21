"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setProducts } from "@/store/productSlice";
import { SerializedProduct } from "@/types/product";

export default function StoreHydrator({ products }: { products: SerializedProduct[] }) {
  const dispatch = useDispatch();
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Only hydrate once per session to maintain performance
    if (!hasHydrated.current && products.length > 0) {
      dispatch(setProducts(products));
      hasHydrated.current = true;
    }
  }, [dispatch, products]);

  return null; // This component doesn't render anything visual
}