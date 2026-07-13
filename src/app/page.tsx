import CategoryBanner from "@/component/Home/Category";
import FootBanner from "@/component/Home/FootBanner";
import FootProductGrid from "@/component/Home/FootProductGrid";
import Hero from "@/component/Home/Hero";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import StyleBand from "@/component/Home/StyleBand";
import { fetchSiteImageMap } from "@/lib/siteImages";

// Re-fetch admin-uploaded images at most every 5 minutes in production.
export const revalidate = 300;

export default async function Home() {
  const images = await fetchSiteImageMap();

  return(
    <>
    <CategoryBanner images={images}/>
    <Hero images={images}/>
    <StyleBand images={images}/>
    <NewArrivalsSection/>
    <FootBanner images={images}/>
    <FootProductGrid images={images}/>
    </>
  )
};
