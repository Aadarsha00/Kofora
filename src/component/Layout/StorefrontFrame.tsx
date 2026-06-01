"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "@/component/Navbar/Annoucement";
import MainNavbar from "@/component/Navbar/Navbar";
import DiscountPill from "@/ui/DiscountPill";
import Footer from "@/component/Footer/Footer";
import ProductModal from "@/component/Product/ProductModal";

// The admin dashboard renders its own chrome, so the storefront navbar/footer
// are suppressed for any /admin route.
export default function StorefrontFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <MainNavbar />
      <DiscountPill />
      {children}
      <Footer />
      <ProductModal />
    </>
  );
}
