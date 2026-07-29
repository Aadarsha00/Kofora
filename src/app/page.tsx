import CategoryBanner from "@/component/Home/Category";
import FootBanner from "@/component/Home/FootBanner";
import FootProductGrid from "@/component/Home/FootProductGrid";
import Hero from "@/component/Home/Hero";
import HeightBand from "@/component/Home/HeightBand";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import PromiseBand from "@/component/Home/PromiseBand";
import StyleBand from "@/component/Home/StyleBand";
import { getHomepageTiles } from "@/api/homepageTile.api";
import { fetchSiteImageMap } from "@/lib/siteImages";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function Home() {
  const [images, homepageTiles] = await Promise.all([
    fetchSiteImageMap(),
    getHomepageTiles().catch(() => null),
  ]);

  return (
    <>
      <CategoryBanner tiles={homepageTiles} />
      <Hero images={images} />
      <StyleBand images={images} />
      <PromiseBand />
      <NewArrivalsSection />
      <HeightBand images={images} />
      <FootBanner />
      <FootProductGrid images={images} />
    </>
  );
}
