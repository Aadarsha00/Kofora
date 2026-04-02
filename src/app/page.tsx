import CategoryBanner from "@/component/Home/Category";
import FootBanner from "@/component/Home/FootBanner";
import FootProductGrid from "@/component/Home/FootProductGrid";
import Hero from "@/component/Home/Hero";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import ProductGrid from "@/component/Home/ProductGrid";
import SockLengthGuide from "@/component/Home/SockLength";


export default function Home() {
  return(
    <>
    
    <CategoryBanner/>
    <Hero/>
    <ProductGrid/>
    <NewArrivalsSection/>
    <SockLengthGuide/>
    <FootBanner/>
    <FootProductGrid/>
    
    </>
  )
};