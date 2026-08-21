import CategoryBanner from "@/component/Home/Category";
import CollabBand from "@/component/Home/CollabBand";
import FootBanner from "@/component/Home/FootBanner";
import FootProductGrid from "@/component/Home/FootProductGrid";
import Hero from "@/component/Home/Hero";
import HeightBand from "@/component/Home/HeightBand";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import PromiseBand from "@/component/Home/PromiseBand";
import StyleBand from "@/component/Home/StyleBand";
import { getHomepageCollabs } from "@/api/collab.api";
import { getHomepageTiles } from "@/api/homepageTile.api";
import { getCategoriesServer } from "@/lib/categories.server";
import { fetchSiteMedia } from "@/lib/siteImages";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function Home() {
  const [media, homepageTiles, collabs, categories] = await Promise.all([
    fetchSiteMedia(),
    getHomepageTiles().catch(() => null),
    getHomepageCollabs().catch(() => null),
    getCategoriesServer().catch(() => []),
  ]);

  return (
    <>
      <CategoryBanner tiles={homepageTiles} />
      <Hero images={media.images} videos={media.videos} />
      <StyleBand images={media.images} />
      <PromiseBand />
      <CollabBand collabs={collabs} categories={categories} />
      <NewArrivalsSection />
      <HeightBand images={media.images} />
      <FootBanner />
      <FootProductGrid images={media.images} />
    </>
  );
}
