import { Suspense } from "react";
import ProductDetails from "@/component/Product/ProductDetails";

export default async function ProductPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading…</div>}>
      <ProductDetails key={params.id} isModal={false} />
    </Suspense>
  );
}