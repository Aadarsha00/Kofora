import Image from "next/image";

const heroData = {
  title: "BETTER FEEL EVERY STEPS",
  subtitle: "Premium Comfort guaranteed for life",
  image: "/hero.webp",
  ctas: [
    { label: "SHOP MEN",   href: "/collections/men"   },
    { label: "SHOP WOMEN", href: "/collections/women" },
  ],
};

export default function Hero() {
  return (
    <section className="relative w-full h-140 overflow-hidden">
      <Image
        src={heroData.image}
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent" />

      <div className="absolute top-1/2 -translate-y-1/2 left-18.75 flex flex-col gap-4">
        <h1 className="text-white font-black text-[56px] leading-none tracking-tight uppercase font-['Inter'] max-w-175">
          {heroData.title}
        </h1>
        <p className="text-white font-['Inter'] italic text-lg font-light">
          {heroData.subtitle}
        </p>
        <div className="flex flex-row gap-4 mt-2">
          {heroData.ctas.map((cta) => (
            <a
              key={cta.label}
              href={cta.href}
              className="bg-[#253E38] text-white font-['Inter'] font-bold text-sm tracking-widest px-6 py-3 hover:bg-[#1a2e28] transition-colors duration-200 whitespace-nowrap"
            >
              {cta.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}