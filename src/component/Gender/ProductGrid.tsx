import { Product } from "@/interface/Product";
import ProductCard from "@/ui/ProductCard";

export default function ProductGrid({
  products,
  gender,
}: {
  products: Product[];
  gender: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-400 text-lg font-medium">No products found</p>
        <p className="text-gray-300 text-sm mt-1">Try removing some filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} gender={gender} />
      ))}
    </div>
  );
}
