import Image from "next/image";

const products = [
  { id: 1, image: "/socks1.webp", name: "Product 1" },
  { id: 2, image: "/socks2.webp", name: "Product 2" },
  { id: 3, image: "/socks3.webp", name: "Product 3" },
  { id: 4, image: "/socks5.webp", name: "Product 4" },
];

export default function ProductGrid() {
  return (
    <section className="w-full grid grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="relative aspect-3/4 bg-[#D9D9D9] overflow-hidden group cursor-pointer"
        >
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
      ))}
    </section>
  );
}