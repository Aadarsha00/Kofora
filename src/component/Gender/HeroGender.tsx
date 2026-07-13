"use client";

import { Category } from "@/interface/Category";

interface CategoryHeroProps {
  category: Category;
}

// Fallback hero images bundled with the frontend, used only when the category
// has no image uploaded from the backend admin.
export const LOCAL_HERO_IMAGES: Record<string, string> = {
  socks: "/socks-hero.webp",
  men: "/men-hero.webp",
  women: "/women-hero.jpg",
  kids: "/kids-hero.webp",
  caps: "/caps-hero.jpg",
};

export default function HeroGender({ category }: CategoryHeroProps) {
  const backgroundImage =
    category.image || // Image uploaded from the backend admin (source of truth)
    LOCAL_HERO_IMAGES[category.slug] || // Bundled fallback per slug
    "/socks-hero.webp"; // Final fallback if nothing else is available

  return (
    <div className="relative w-full h-110 md:h-130 overflow-hidden group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out scale-100 group-hover:scale-105"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-white font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-none capitalize">
          <span className="inline-block hover:underline underline-offset-4 decoration-white decoration-2 cursor-pointer transition-all duration-200">
            {category.name}
          </span>
        </h1>

        {category.description && (
          <p className="mt-4 text-white/75 text-sm md:text-base tracking-widest uppercase font-light">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
}