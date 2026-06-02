import Image from "next/image";
import { Product } from "@/interface/Product";
import { defaultDisplayImages } from "@/lib/productImages";

export default function ProductFeatures({ product }: { product: Product }) {
  const activeImages = defaultDisplayImages(product);
  const featureImage = activeImages[1]?.image ?? activeImages[0]?.image;
  const highlights = [
    product.short_description
      ? {
          title: "Comfort",
          description: product.short_description,
        }
      : null,
    product.full_description
      ? {
          title: "Details",
          description: product.full_description,
        }
      : null,
    product.brand
      ? {
          title: "Brand",
          description: `${product.brand} essentials built for daily wear.`,
        }
      : null,
  ].filter(Boolean) as { title: string; description: string }[];

  if (!featureImage && highlights.length === 0) return null;

  return (
    <section className="w-full bg-[#f7f7f4] px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Product Highlights</p>
          <h2 className="mt-3 text-3xl font-bold text-black md:text-4xl">{product.name}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((feature) => (
              <div key={feature.title} className="border-t border-gray-300 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-black">{feature.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {featureImage && (
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-200">
            <Image
              src={featureImage}
              alt={activeImages[1]?.alt_text || activeImages[0]?.alt_text || product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
