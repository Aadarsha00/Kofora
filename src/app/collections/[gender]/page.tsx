import HeroGender from "@/component/Gender/HeroGender";
import CollectionView from "@/component/Gender/CollectionView";
import { getCategoryBySlug, categories } from "@/data/Category";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return categories.map((category) => ({ gender: category.slug }));
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<{ sort_by?: string; "filter.p.m.custom.sub_category"?: string | string[] }>;
}) {
  const { gender } = await params;
  const resolvedSearchParams = await searchParams;

  const category = getCategoryBySlug(gender);
  if (!category) notFound();

  return (
    <main>
      <HeroGender category={category!} />
      <CollectionView gender={gender} searchParams={resolvedSearchParams} />
    </main>
  );
}