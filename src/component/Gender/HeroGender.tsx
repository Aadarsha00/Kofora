"use client";

import { Category } from "@/interface/Category";

interface CategoryHeroProps {
  category: Category;
}

export default function HeroGender({ category }: CategoryHeroProps) {
  const backgroundImage =
    category.image ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80";

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