import { Category } from "@/interface/Category";

export const categories: Category[] = [
  {
    slug: "women",
    title: "WOMEN SOCKS",
    subtitle: "Elegant styles for every occasion",
    image: "/women5.webp",
    imageAlt: "Women's socks collection",
  },
  {
    slug: "men",
    title: "MEN SOCKS",
    subtitle: "Classic comfort, modern edge",
    image: "/images/categories/men-socks.jpg",
    imageAlt: "Men's socks collection",
  },
  {
    slug: "kids",
    title: "KIDS SOCKS",
    subtitle: "Fun, durable, and colourful",
    image: "/images/categories/kids-socks.jpg",
    imageAlt: "Kids' socks collection",
  },
  {
    slug: "sport",
    title: "SPORT SOCKS",
    subtitle: "Performance meets comfort",
    image: "/images/categories/sport-socks.jpg",
    imageAlt: "Sport socks collection",
  },
];
 
export function getCategoryBySlug(slug: string): Category | undefined {
  console.log("[getCategoryBySlug] Looking for slug:", slug);
  console.log("[getCategoryBySlug] Available slugs:", categories.map(c => c.slug));
  const result = categories.find((c) => c.slug === slug);
  console.log("[getCategoryBySlug] Result:", result);
  return result;
}
 