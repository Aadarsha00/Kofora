import { Suspense } from "react";
import ProductDetails from "@/component/Product/ProductDetails";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const [routeParams, queryParams] = await Promise.all([params, searchParams]);
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading…</div>}>
      <ProductDetails key={queryParams.id ?? routeParams.slug} isModal={false} />
    </Suspense>
  );
}
