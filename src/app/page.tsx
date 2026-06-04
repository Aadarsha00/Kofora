import CategoryBanner from "@/component/Home/Category";
import FootBanner from "@/component/Home/FootBanner";
import FootProductGrid from "@/component/Home/FootProductGrid";
import Hero from "@/component/Home/Hero";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import SockLengthGuide from "@/component/Home/SockLength";
import StyleBand from "@/component/Home/StyleBand";


export default function Home() {
  return(
    <>
    <CategoryBanner/>
    <Hero/>
    <StyleBand/>
    <NewArrivalsSection/>
    <SockLengthGuide/>
    <FootBanner/>
    <FootProductGrid/>

    </>
  )
};
