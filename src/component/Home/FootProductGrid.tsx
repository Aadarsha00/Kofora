import Image from "next/image";

const categories = [
  {
    id: 1,
    image: "/women3.webp",
    subtitle: "Comfort Beyond Socks",
    title: "SLIPPERS & SHOES",
  },
  {
    id: 2,
    image: "/women1.webp",
    subtitle: "Comfort Beyond Socks",
    title: "Best Seller",
  },
  {
    id: 3,
    image: "/women2.webp",
    subtitle: "Comfort Beyond Socks",
    title: "New Release",
  },
];

export default function FootProductGrid() {
  return (
    <section className="grid grid-cols-3 w-full h-[800px]">
      {categories.map((cat) => (
        <div key={cat.id} className="relative overflow-hidden cursor-pointer group">
          <Image
            src={cat.image}
            alt={cat.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Subtle dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <p className="text-xs tracking-widest mb-1 font-light">
              {cat.subtitle}
            </p>
            <h3 className="text-2xl font-bold tracking-widest underline-offset-4 group-hover:underline">
              {cat.title}
            </h3>
          </div>
        </div>
      ))}
    </section>
  );
}