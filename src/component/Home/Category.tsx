import Image from "next/image";

const categoryBanners = [
  { label: "WOMEN'S", image: "/women.webp", href: "/womens" },
  { label: "MEN'S",   image: "/men.webp",   href: "/mens"   },
  { label: "KID'S",   image: "/kid.webp",   href: "/kids"   },
];

export default function CategoryBanner() {
  return (
    <section className="w-full grid grid-cols-3 h-60">
      {categoryBanners.map((cat) => (
        <a
          key={cat.label}
          href={cat.href}
          className="relative overflow-hidden group"
        >
          <Image
            src={cat.image}
            alt={cat.label}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
          {/* Label — vertically & horizontally centered */}
          <span className="absolute inset-0 flex items-center justify-center text-white font-['Inter'] font-bold text-base tracking-widest whitespace-nowrap">
            {cat.label}
          </span>
          {/* Column divider */}
          <div className="absolute right-0 top-0 h-full w-px bg-white/40" />
        </a>
      ))}
    </section>
  );
}