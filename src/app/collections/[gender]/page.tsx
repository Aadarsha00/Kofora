import HeroGender from "@/component/Gender/HeroGender";
import CollectionView from "@/component/Gender/CollectionView";

import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/api/category.api";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ gender: category.slug }));
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<{ sort_by?: string }>;
}) {
  const { gender } = await params;
  const resolvedSearchParams = await searchParams;

  let category;
  try {
    category = await getCategoryBySlug(gender);
  } catch {
    notFound();
  }

  return (
    <main>
      <HeroGender category={category!} />
      <CollectionView categoryId={category!.id} gender={gender} searchParams={resolvedSearchParams} />
    </main>
  );
}