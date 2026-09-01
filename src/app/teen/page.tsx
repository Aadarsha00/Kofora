import { notFound } from "next/navigation";
import HeroGender from "@/component/Gender/HeroGender";
import CollectionView from "@/component/Gender/CollectionView";
import { getCategoryBySlugServer } from "@/lib/categories.server";

export const dynamic = "force-dynamic";

export default async function TeenPage() {
  let category;
  try {
    category = await getCategoryBySlugServer("teens");
  } catch {
    notFound();
  }

  return (
    <main>
      <HeroGender category={category} />
      <CollectionView
        categoryId={category.id}
        gender="teens"
        collectionLabel={category.name}
        searchParams={{}}
      />
    </main>
  );
}
