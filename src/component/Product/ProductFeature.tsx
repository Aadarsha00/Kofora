"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { getProductBySlug } from "@/data/ProductsData";

export default function ProductFeatures() {
  const { gender, slug } = useParams();
  const product = getProductBySlug(gender as string, slug as string);

  if (!product || !product.features || !product.tagline) return null;

  return (
    <div className="w-full bg-gray-100 px-5 pb-10 pt-10 lg:-mt-40 lg:px-10 lg:pb-12">
      <h2 className="mb-8 text-center text-2xl font-black uppercase tracking-tight text-black md:text-3xl lg:mb-10">
        {product.tagline}
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {product.features.map((feature, i) => (
          <div key={i} className="flex flex-col">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-base font-bold text-black mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
