"use client";
import { Suspense } from "react";
import ProductDetails from "./ProductDetails";
import { useProductModal } from "@/store/productModalStore";

// ProductModal.tsx
export default function ProductModal() {
  const { productId, close } = useProductModal();
  if (!productId) return null;

  return (
    <Suspense fallback={null}>
      <ProductDetails key={productId} isModal={true} onClose={close} productId={productId} /> {/* ← pass productId */}
    </Suspense>
  );
}