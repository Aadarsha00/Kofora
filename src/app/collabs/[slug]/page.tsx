import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getCollab } from "@/api/collab.api";
import ProductCard from "@/ui/ProductCard";
import { getProductGender } from "@/lib/searchHelpers";
import { getCategoriesServer } from "@/lib/categories.server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collab = await getCollab(slug).catch(() => null);
  if (!collab) return { title: "Collection not found" };

  return {
    title: collab.partner_name ? `Kofora × ${collab.partner_name}` : collab.name,
    description: collab.tagline || collab.description || undefined,
  };
}

export default async function CollabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [collab, categories] = await Promise.all([
    getCollab(slug).catch(() => null),
    getCategoriesServer().catch(() => []),
  ]);

  // A collab outside its run window is filtered out by the API for shoppers,
  // so a miss here is a genuine 404.
  if (!collab) notFound();

  const products = (collab.products ?? []).filter(
    (product) => product.is_active && product.is_published
  );

  return (
    <div className="w-full bg-white">
      <section
        className="relative isolate w-full overflow-hidden bg-[var(--collab-accent)]"
        style={
          {
            "--collab-accent": collab.accent_color,
            "--collab-text": collab.text_color,
          } as CSSProperties
        }
      >
        <div className="relative flex min-h-[380px] w-full items-center justify-center px-6 py-20 text-center md:min-h-[500px]">
          {(collab.hero_image || collab.banner_image) && (
            <>
              <Image
                src={(collab.hero_image || collab.banner_image) as string}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
            </>
          )}

          <div className="relative z-10 flex max-w-2xl flex-col items-center text-[var(--collab-text)]">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] opacity-80 md:text-xs">
              {collab.partner_name ? `Kofora × ${collab.partner_name}` : "Limited collection"}
            </p>

            {collab.logo ? (
              <Image
                src={collab.logo}
                alt={collab.name}
                width={480}
                height={140}
                className="mb-6 h-auto w-auto max-h-24 max-w-[min(80vw,480px)] object-contain md:max-h-32"
                priority
              />
            ) : (
              <h1 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.03em] md:text-6xl">
                {collab.name}
              </h1>
            )}

            {collab.tagline && (
              <p className="max-w-xl text-base font-medium leading-relaxed opacity-90 md:text-xl">
                {collab.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {collab.description && (
        <section className="mx-auto max-w-3xl px-6 py-12 text-center md:py-16">
          <p className="whitespace-pre-line text-sm leading-relaxed text-black/70 md:text-base">
            {collab.description}
          </p>
        </section>
      )}

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-20 md:px-12">
        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            This collection drops soon. Check back shortly.
          </p>
        ) : (
          // A collab can span audiences, so each card resolves its own gender
          // segment for the product URL rather than sharing one.
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                gender={getProductGender(product, categories)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
