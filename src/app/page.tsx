import CategoryBanner from "@/component/Home/Category";
import Hero from "@/component/Home/Hero";
import NewArrivalsSection from "@/component/Home/NewArrivalSection";
import ProductGrid from "@/component/Home/ProductGrid";
import SockLengthGuide from "@/component/Home/SockLength";
import AnnouncementBar from "@/component/Navbar/Annoucement";
import DiscountPill from "@/component/Navbar/DiscountPill";
import MainNavbar from "@/component/Navbar/Navbar";

export default function Home() {
  return(
    <>
    <AnnouncementBar/>
    <MainNavbar/>
    <CategoryBanner/>
    <Hero/>
    <ProductGrid/>
    <NewArrivalsSection/>
    <SockLengthGuide/>
    <DiscountPill/>
    </>
  )
};