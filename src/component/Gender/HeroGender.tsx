"use client";
import { Category } from "@/interface/Category";


interface CategoryHeroProps {
  category: Category;
}

export default function HeroGender({ category }: CategoryHeroProps) {
  return (
    <div className="relative w-full h-110 md:h-130 overflow-hidden group">
      {/* Background Image with zoom on hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out scale-100 group-hover:scale-105"
        style={{ backgroundImage: `url('${category.image}')` }}
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-white font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-none">
          <span className="inline-block hover:underline underline-offset-4 decoration-white decoration-2 cursor-pointer transition-all duration-200">
            {category.title}
          </span>
        </h1>

        {category.subtitle && (
          <p className="mt-4 text-white/75 text-sm md:text-base tracking-widest uppercase font-light">
            {category.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}